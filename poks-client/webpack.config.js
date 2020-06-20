const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { TsConfigPathsPlugin } = require('awesome-typescript-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const ROOT = path.resolve( __dirname, 'src' );
const SERVER_ROOT = path.resolve( __dirname, '../poks-server/src' );
const DESTINATION = path.resolve( __dirname, 'dist' );

console.log('webpack', process.env.NODE_ENV)
function getServerUrl() {
    switch (process.env.NODE_ENV) {
        case 'production':
            return 'wss://prod.site:443'
        case 'dev':
        case 'ci':
        default:
            return 'wss://localhost:44443'
    }
}

module.exports = {
    context: ROOT,

    entry: {
        'main': './main.ts'
    },
    
    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
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
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false
            }
        }),
        new webpack.DefinePlugin({
            SERVER_URL: JSON.stringify(getServerUrl())
        })
    ],

    devtool: 'cheap-module-source-map',
    devServer: {}
};

