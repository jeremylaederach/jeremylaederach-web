<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if ($request->expectsJson()) {
                return null;
            }

            $requestedLocale = $request->segment(1);
            $locales = config('portfolio.locales');
            $locale = array_key_exists($requestedLocale, $locales)
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
