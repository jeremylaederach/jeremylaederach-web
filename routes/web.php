<?php

use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/'.config('portfolio.default_locale'));
Route::redirect('/quantified', '/'.config('portfolio.default_locale').'/quantified');

Route::pattern('locale', implode('|', array_keys(config('portfolio.locales'))));

Route::get('/{locale}', [PortfolioController::class, 'home'])->name('home');
Route::get('/{locale}/about', [PortfolioController::class, 'about'])->name('about');
Route::get('/{locale}/projects', [PortfolioController::class, 'projects'])->name('projects');
Route::get('/{locale}/quantified', [PortfolioController::class, 'quantified'])->name('quantified');
Route::get('/{locale}/contact', [PortfolioController::class, 'contact'])->name('contact');
Route::get('/{locale}/imprint', [PortfolioController::class, 'imprint'])->name('imprint');
