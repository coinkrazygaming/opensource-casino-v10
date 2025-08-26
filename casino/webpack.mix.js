const mix = require('laravel-mix');
const path = require('path');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// Use js() instead of ts() for Laravel Mix 4.x compatibility
mix.js('resources/ts/app.ts', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .options({
        processCssUrls: false
    });

// Enable source maps for development
if (!mix.inProduction()) {
    mix.sourceMaps();
}

// Configure TypeScript support via Babel (Laravel Mix 4.x compatible)
mix.webpackConfig({
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@': path.resolve('resources/ts'),
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript'
                            ]
                        }
                    }
                ]
            }
        ]
    }
});
