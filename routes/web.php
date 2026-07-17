<?php

use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/'.config('portfolio.default_locale'));
Route::redirect('/quantified', '/'.config('portfolio.default_locale').'/quantified');
Route::redirect('/jay-jay', '/'.config('portfolio.default_locale').'/jay-jay');
Route::redirect('/jay-jay-client-hub', '/'.config('portfolio.default_locale').'/jay-jay#client-hub', 301);
Route::redirect('/session-deck', '/'.config('portfolio.default_locale').'/session-deck');

Route::pattern('locale', implode('|', array_keys(config('portfolio.locales'))));

Route::get('/{locale}', [PortfolioController::class, 'home'])->name('home');
Route::get('/{locale}/about', [PortfolioController::class, 'about'])->name('about');
Route::get('/{locale}/projects', [PortfolioController::class, 'projects'])->name('projects');
Route::get('/{locale}/quantified', [PortfolioController::class, 'quantified'])->name('quantified');
Route::get('/{locale}/jay-jay', [PortfolioController::class, 'jayJay'])->name('jay-jay');
Route::get('/{locale}/jay-jay-client-hub', [PortfolioController::class, 'jayJayClientHub'])->name('jay-jay-client-hub');
Route::get('/{locale}/session-deck', [PortfolioController::class, 'sessionDeck'])->name('session-deck');
Route::get('/{locale}/contact', [PortfolioController::class, 'contact'])->name('contact');
Route::get('/{locale}/imprint', [PortfolioController::class, 'imprint'])->name('imprint');
Route::get('/{locale}/privacy', [PortfolioController::class, 'privacy'])->name('privacy');
