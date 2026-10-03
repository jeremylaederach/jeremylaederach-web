import ftplib
import importlib.util
import io
from pathlib import Path
import ssl
import sys
import tempfile
import unittest
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "deploy_static", Path(__file__).parents[2] / "scripts" / "deploy_static.py"
)
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class FakeFTP:
    def __init__(self, fail_upload=False):
        self.events = []
        self.directory = Path("/")
        self.fail_upload = fail_upload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def connect(self, *args):
        self.events.append(("connect", args))

    def login(self, *args):
        self.events.append(("login",))

    def prot_p(self):
        self.events.append(("protect_data",))

    def cwd(self, directory):
        self.directory = Path("/") if directory == "/" else self.directory / directory

    def retrbinary(self, command, receive):
        self.events.append(("read", command))
        receive(b'<link rel="canonical" href="https://jeremylaederach.ch/de/">')

    def storbinary(self, command, content):
        self.events.append(("store", command, content.read()))
        if self.fail_upload:
            raise ftplib.error_temp("Transfer failed")

    def rename(self, temporary, destination):
        self.events.append(("rename", temporary, (self.directory / destination).as_posix()))

    def delete(self, name):
        self.events.append(("delete", name))


class DeploymentTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in deploy.REQUIRED | {"build/assets/app-hash.css", "build/assets/app-hash.js"}:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("test " + name, encoding="utf-8")

    def test_assets_are_uploaded_before_html(self):
        ftp = FakeFTP()
        deploy.upload_files(ftp, self.root, deploy.package_files(self.root))
        published = [event[2].removeprefix("/") for event in ftp.events if event[0] == "rename"]
        self.assertEqual(published[0], ".htaccess")
        first_html = next(i for i, name in enumerate(published) if name.endswith(".html"))
        self.assertTrue(all(name.endswith(".html") for name in published[first_html:]))
        self.assertIn("build/assets/app-hash.js", published[:first_html])
        self.assertFalse(any(event[0] == "delete" for event in ftp.events))
        self.assertTrue(all(event[1].startswith("STOR .deploy-")
                            for event in ftp.events if event[0] == "store"))

    def test_failed_transfer_preserves_live_file(self):
        ftp = FakeFTP(fail_upload=True)
        with self.assertRaises(ftplib.error_temp):
            deploy.upload_files(ftp, self.root, [Path("de/index.html")])
        self.assertFalse(any(event[0] == "rename" for event in ftp.events))
        deleted = [event[1] for event in ftp.events if event[0] == "delete"]
        self.assertEqual(len(deleted), 1)
        self.assertTrue(deleted[0].startswith(".deploy-"))

    def test_protected_paths_and_all_php_are_rejected(self):
        for name in [".env", ".well-known/token", "wp-content/settings.json",
                     "node_modules/package.json", "api/contact.php", "index.PHP", "bad\nname"]:
            with self.subTest(name=name):
                if "\n" in name and sys.platform == "win32":
                    continue  # Windows itself forbids control characters in filenames.
                path = self.root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("must not deploy")
                with self.assertRaises(deploy.DeploymentError):
                    deploy.package_files(self.root)
                path.unlink()

    def test_every_required_file_is_checked(self):
        for name in deploy.REQUIRED:
            with self.subTest(name=name):
                path = self.root / name
                content = path.read_bytes()
                path.unlink()
                with self.assertRaisesRegex(deploy.DeploymentError, "incomplete"):
                    deploy.package_files(self.root)
                path.write_bytes(content)

    def test_symbolic_links_are_rejected(self):
        link = self.root / "linked-file"
        try:
            link.symlink_to(self.root / "index.html")
        except OSError:
            self.skipTest("Symbolic links are unavailable on this host")
        with self.assertRaises(deploy.DeploymentError):
            deploy.package_files(self.root)

    def test_wrong_ftp_root_is_rejected_before_upload(self):
        ftp = FakeFTP()
        ftp.retrbinary = lambda command, receive: receive(b"https://jay-jay.ch/de/")
        with self.assertRaises(deploy.DeploymentError):
            deploy.verify_target(ftp)
        self.assertFalse(any(event[0] == "store" for event in ftp.events))

    def test_oversized_target_page_is_rejected(self):
        ftp = FakeFTP()
        ftp.retrbinary = lambda command, receive: receive(b"x" * (1024 * 1024 + 1))
        with self.assertRaises(deploy.DeploymentError):
            deploy.verify_target(ftp)

    def test_tls_and_target_are_verified_before_upload(self):
        ftp = FakeFTP()
        with patch.dict("os.environ", {
            "DEPLOY_FTP_USERNAME": deploy.DEPLOY_USER, "DEPLOY_FTP_PASSWORD": "test-only"
        }), patch.object(sys, "argv", ["deploy_static.py", str(self.root)]), \
                patch.object(deploy.ftplib, "FTP_TLS", return_value=ftp) as client, \
                patch.object(deploy, "verify_live"):
            deploy.main()
        context = client.call_args.kwargs["context"]
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
        self.assertEqual(context.minimum_version, ssl.TLSVersion.TLSv1_2)
        self.assertEqual(ftp.events[0], ("connect", ("117.hosttech.eu", 21)))
        events = [event[0] for event in ftp.events]
        self.assertLess(events.index("protect_data"), events.index("read"))
        self.assertLess(events.index("read"), events.index("store"))

    def test_wrong_or_missing_credentials_never_connect(self):
        for username, password in [("", ""), (deploy.DEPLOY_USER, ""),
                                   ("jay-jay-deploy", "test-only"), ("master", "test-only")]:
            with self.subTest(username=username), patch.dict("os.environ", {
                "DEPLOY_FTP_USERNAME": username, "DEPLOY_FTP_PASSWORD": password
            }), patch.object(sys, "argv", ["deploy_static.py", str(self.root)]), \
                    patch.object(deploy.ftplib, "FTP_TLS") as client:
                with self.assertRaises(deploy.DeploymentError):
                    deploy.main()
                client.assert_not_called()

    def test_check_only_never_connects(self):
        with patch.object(sys, "argv", ["deploy_static.py", "--check-only", str(self.root)]), \
                patch.object(deploy.ftplib, "FTP_TLS") as client, \
                patch.object(deploy, "urlopen") as request:
            deploy.main()
        client.assert_not_called()
        request.assert_not_called()

    def test_live_mismatch_is_detected(self):
        with patch.object(deploy, "urlopen", return_value=io.BytesIO(b"Stale HTML")):
            with self.assertRaisesRegex(deploy.DeploymentError, "differs"):
                deploy.verify_live(self.root, [Path("de/index.html")])

    def test_matching_live_files_are_accepted(self):
        for name in ("de/index.html", "build/assets/app-hash.css", "build/assets/app-hash.js"):
            content = io.BytesIO((self.root / name).read_bytes())
            with self.subTest(name=name), patch.object(deploy, "urlopen", return_value=content) as request:
                deploy.verify_live(self.root, [Path(name)])
            self.assertEqual(request.call_args.args[0].full_url, deploy.SITE_URL + "/" + name)


if __name__ == "__main__":
    unittest.main()
