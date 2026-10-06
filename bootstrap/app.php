<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php')
    ->withMiddleware(function (Middleware $middleware): void {
        // Every page is exported as a static file: no cookies, sessions or forms.
        $middleware->group('web', []);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            $requestedLocale = $request->segment(1);
            $locale = $requestedLocale !== null && array_key_exists($requestedLocale, config('portfolio.locales'))
                ? $requestedLocale
                : config('portfolio.default_locale');

            App::setLocale($locale);

            return response()->view('errors.404', [
                'locale' => $locale,
                'content' => config("portfolio.content.{$locale}"),
                'routeName' => 'not-found',
            ], 404);
        });
    })->create();
