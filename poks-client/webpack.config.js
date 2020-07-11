const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SubresourceIntegrityPlugin = require('webpack-subresource-integrity')

const ROOT = path.resolve( __dirname, 'src' )
const SERVER_ROOT = path.resolve( __dirname, '../poks-server/src' )
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
        'index': './site/index/index.ts',
        '404': './site/404/404.ts',
        'planning-estimation-scale-decks': './site/planning-estimation-scale-decks/planning-estimation-scale-decks.ts'
    },
    
    output: {
        filename: '[name].bundle.js',
        path: DESTINATION,
        crossOriginLoading: 'anonymous'
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
            // {
            //     test: /index\.html$/i,
            //     use: ['html-loader']
            // },
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
                loaders: ['babel-loader'],
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
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify(getServerUrl())
        }),
        new HtmlWebpackPlugin({
            template: 'app/app.html',
            filename: 'app.html',
            inject: true,
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            template: 'site/index/index.hbs',
            filename: 'index.html',
            inject: true,
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: 'site/404/404.html',
            filename: '404.html',
            inject: true,
            chunks: ['404']
        }),
        new HtmlWebpackPlugin({
            template: 'site/planning-estimation-scale-decks/planning-estimation-scale-decks.hbs',
            filename: 'planning-estimation-scale-decks.html',
            inject: true,
            chunks: ['planning-estimation-scale-decks']
        }),
        new SubresourceIntegrityPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ci'),
        })
    ],

    devtool: 'cheap-module-source-map'
};
