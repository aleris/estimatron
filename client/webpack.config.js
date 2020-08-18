const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const SubresourceIntegrityPlugin = require('webpack-subresource-integrity')
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const ROOT = path.resolve( __dirname, 'src' )
const SERVER_ROOT = path.resolve( __dirname, '../estimatron-server/src' )
const DESTINATION = path.resolve( __dirname, 'dist' )

const dev = process.env.NODE_ENV !== 'production';

function getServerUrl() {
    switch (process.env.NODE_ENV) {
        case 'production':
            return 'wss://localhost:44443'
        case 'dev':
        case 'ci':
        default:
            return 'wss://localhost:44443'
    }
}

module.exports = {
    devServer: {
        host: 'localhost',
        port: '9000',
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        historyApiFallback: true
    },

    mode: dev ? 'development' : 'production',

    context: ROOT,

    entry: {
        'app': ['@babel/polyfill', './app/app.ts'],
        '404': './site/404/404.ts',
        'index': ['@babel/polyfill', './site/index/index.ts'],
        'planning-estimation-scale-decks': './site/planning-estimation-scale-decks/planning-estimation-scale-decks.ts',
        'agile-planning-estimation': './site/agile-planning-estimation/agile-planning-estimation.ts'
    },
    
    output: {
        filename: '[name].[hash].js',
        path: DESTINATION,
        crossOriginLoading: 'anonymous'
    },

    optimization: {
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            SERVER_ROOT,
            'node_modules'
        ],
        alias: {
            createjs: 'createjs/builds/1.0.0/createjs.js'
        }
    },

    module: {
        rules: [
            /****************
            * PRE-LOADERS
            *****************/
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },

            /****************
            * LOADERS
            *****************/
            {
                test: /node_modules[/\\]createjs/,
                use: [
                    {
                        loader: 'exports-loader',
                        options: {
                            exports: 'default window.createjs',
                        }
                    },
                    {
                        loader: 'imports-loader',
                        options: {
                            wrapper: 'window',
                        }
                    }
                ]
            },
            {
                test: /\.hbs$/,
                use: [
                    {
                        loader: 'handlebars-loader'
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'html-loader'
                    },
                ]

            },
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(),

        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify(getServerUrl())
        }),
        new HtmlPlugin({
            template: 'app/app.hbs',
            filename: 'app.html',
            inject: true,
            chunks: ['app']
        }),
        new HtmlPlugin({
            template: 'site/404/404.hbs',
            filename: '404.html',
            inject: true,
            chunks: ['404']
        }),
        new HtmlPlugin({
            template: 'site/index/index.hbs',
            filename: 'index.html',
            inject: true,
            chunks: ['index']
        }),
        new HtmlPlugin({
            template: 'site/planning-estimation-scale-decks/planning-estimation-scale-decks.hbs',
            filename: 'planning-estimation-scale-decks.html',
            inject: true,
            chunks: ['planning-estimation-scale-decks']
        }),
        new HtmlPlugin({
            template: 'site/agile-planning-estimation/agile-planning-estimation.hbs',
            filename: 'agile-planning-estimation.html',
            inject: true,
            chunks: ['agile-planning-estimation']
        }),

        new SubresourceIntegrityPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ci'),
        }),

        new CompressionPlugin(),

        new CopyPlugin({
            patterns: [
                { from: 'site/*.ico', to: '.', flatten: true },
                { from: 'site/*.png', to: '.', flatten: true },
                { from: 'site/*.svg', to: '.', flatten: true },
                { from: 'site/site.webmanifest', to: '.', flatten: true },
                { from: 'site/browserconfig.xml', to: '.', flatten: true }
            ],
        })
    ],

    devtool: 'cheap-module-source-map'
};
