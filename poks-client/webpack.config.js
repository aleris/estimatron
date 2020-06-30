const path = require('path')
const webpack = require('webpack')
const { TsConfigPathsPlugin } = require('awesome-typescript-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SubresourceIntegrityPlugin = require('webpack-subresource-integrity')

const ROOT = path.resolve( __dirname, 'src' );
const SERVER_ROOT = path.resolve( __dirname, '../poks-server/src' );
const DESTINATION = path.resolve( __dirname, 'dist' );

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
    context: ROOT,

    entry: {
        'app': './pages/app/app.ts',
        'index': './pages/index/index.ts',
        '404': './pages/404/404.ts'
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
        plugins: [
            new TsConfigPathsPlugin()
        ]
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
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },

            /****************
            * LOADERS
            *****************/
            {
                test: /\.ts$/,
                exclude: [ /node_modules/ ],
                use: 'awesome-typescript-loader'
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
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/pages/index/index.html'),
            filename: 'index.html',
            inject: true,
            chunks: ['index']
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify(getServerUrl())
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/pages/app/app.html'),
            filename: 'app.html',
            inject: true,
            chunks: ['app']
        }),
        new SubresourceIntegrityPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ci'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/pages/404/404.html'),
            filename: '404.html',
            inject: true,
            chunks: ['404']
        })
    ],

    devtool: 'cheap-module-source-map',
    devServer: {}
};

