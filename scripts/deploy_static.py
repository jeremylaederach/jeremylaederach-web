"""Deploy the checked portfolio through restricted, certificate-verified FTPS."""

import ftplib
import hashlib
import os
from pathlib import Path
import ssl
import sys
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen
import uuid
from xml.etree import ElementTree


SITE_URL = "https://jeremylaederach.ch"
DEPLOY_USER = "jeremylaederach-deploy"
REQUIRED = {".htaccess", "index.html", "404.html", "sitemap.xml", "build/manifest.json"}
SITEMAP_LOCATION = "{http://www.sitemaps.org/schemas/sitemap/0.9}loc"
FORBIDDEN = {".well-known", "wp-content", "vendor", "node_modules", "storage", "app", "config"}


class DeploymentError(ValueError):
    """An operator-facing error whose message never contains a credential."""


def required_files(root):
    """The fixed entry points plus every page the package's own sitemap lists."""
    required = set(REQUIRED)
    try:
        sitemap = ElementTree.parse(root / "sitemap.xml")
    except (OSError, ElementTree.ParseError):
        raise DeploymentError("Deployment package is incomplete") from None
    locations = [node.text or "" for node in sitemap.iter(SITEMAP_LOCATION)]
    if not locations:
        raise DeploymentError("Deployment package is incomplete")
    for location in locations:
        if not location.startswith(SITE_URL + "/"):
            raise DeploymentError("Sitemap lists an address outside the website")
        page = urlsplit(location).path.strip("/")
        locale = page.split("/")[0]
        required.update({f"{page}/index.html", f"{locale}/.htaccess", f"{locale}/404/index.html"})
    return required


def package_files(root):
    files = []
    for path in root.rglob("*"):
        relative = path.relative_to(root)
        if path.is_symlink():
            raise DeploymentError("Deployment package contains a symbolic link")
        if not path.is_file():
            continue
        if any(part in FORBIDDEN or (part.startswith(".") and part != ".htaccess")
               for part in relative.parts):
            raise DeploymentError("Deployment package contains a protected path")
        if any(ord(char) < 32 for char in relative.as_posix()):
            raise DeploymentError("Deployment package contains an unsafe filename")
        if path.suffix.lower() == ".php":
            raise DeploymentError("The portfolio deployment must not contain PHP")
        files.append(relative)
    if not required_files(root).issubset({path.as_posix() for path in files}):
        raise DeploymentError("Deployment package is incomplete")
    # Install dot-file protection first, then assets, then HTML entry points.
    return sorted(files, key=lambda path: (
        0 if path.as_posix() == ".htaccess" else 2 if path.suffix.lower() == ".html" else 1,
        path.as_posix(),
    ))


def verify_target(ftp):
    ftp.cwd("/")
    homepage = bytearray()

    def receive(chunk):
        homepage.extend(chunk)
        if len(homepage) > 1024 * 1024:
            raise DeploymentError("Unexpected production document root")

    ftp.retrbinary("RETR de/index.html", receive)
    if f"{SITE_URL}/de/".encode() not in homepage:
        raise DeploymentError("FTP root is not the existing portfolio website")


def upload_files(ftp, root, files):
    for relative in files:
        ftp.cwd("/")
        for directory in relative.parts[:-1]:
            try:
                ftp.cwd(directory)
            except ftplib.error_perm as error:
                if not str(error).startswith("550"):
                    raise
                ftp.mkd(directory)
                ftp.cwd(directory)
        temporary = f".deploy-{uuid.uuid4().hex}-{relative.name}"
        try:
            with (root / relative).open("rb") as content:
                ftp.storbinary("STOR " + temporary, content)
            # Never truncate the live file while its replacement is transferring.
            ftp.rename(temporary, relative.name)
        except Exception:
            try:
                ftp.delete(temporary)
            except ftplib.all_errors:
                pass
            raise
    # No mirror deletion: previous assets, .well-known and server files survive.


def verify_live(root, files):
    for relative in files:
        if relative.suffix.lower() not in {".html", ".css", ".js"}:
            continue
        url = SITE_URL + "/" + quote(relative.as_posix())
        request = Request(url, headers={"Cache-Control": "no-cache", "Accept-Encoding": "identity"})
        with urlopen(request, timeout=30) as response:
            actual = hashlib.sha256(response.read()).digest()
        if actual != hashlib.sha256((root / relative).read_bytes()).digest():
            raise DeploymentError("Live file differs from the checked package: " + relative.as_posix())


def main():
    arguments = sys.argv[1:]
    check_only = "--check-only" in arguments
    arguments = [argument for argument in arguments if argument != "--check-only"]
    root = Path(arguments[0] if arguments else "dist-static")
    files = package_files(root)
    if check_only:
        print(f"Validated {len(files)} production files; no connection or upload.")
        return
    username = os.environ.get("DEPLOY_FTP_USERNAME", "")
    password = os.environ.get("DEPLOY_FTP_PASSWORD", "")
    if username != DEPLOY_USER or not password:
        raise DeploymentError(f"Configure the dedicated {DEPLOY_USER} credentials first")
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with ftplib.FTP_TLS(context=context, timeout=60) as ftp:
        ftp.connect("117.hosttech.eu", 21)
        ftp.login(username, password)
        ftp.prot_p()
        print("Verifying the production FTP root.", flush=True)
        verify_target(ftp)
        print(f"Uploading {len(files)} checked files.", flush=True)
        upload_files(ftp, root, files)
    print("Comparing published HTML, CSS and JavaScript with the checked package.", flush=True)
    verify_live(root, files)
    print(f"Uploaded and verified {len(files)} production files.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Server exceptions can contain credentials; do not print their messages.
        detail = str(error) if isinstance(error, DeploymentError) else type(error).__name__
        print(f"Deployment stopped: {detail}. Check target, credentials and live state.",
              file=sys.stderr)
        sys.exit(1)
