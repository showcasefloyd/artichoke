const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const proxyTarget = process.env.WEBPACK_PROXY_TARGET || 'http://localhost:3000/';

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        app: './src/modules/ts/app/index.tsx',
        admin: './src/modules/ts/admin/index.tsx',
    },
    output: {
        path: path.join(__dirname, '/app/build'),
        filename: 'js/[name].js',
        publicPath: '/build/',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    devServer: {
        static: {
            directory: path.join(__dirname, '/app'),
        },
        host: '0.0.0.0',
        compress: true,
        port: 8093,
        proxy: [
            { context: ['/'], target: proxyTarget },
        ],
        client: {
            overlay: { errors: true, warnings: false },
        },
    },
    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { api: 'modern', sourceMap: true } },
                ],
            },
            {
                test: /\.(woff2?|eot|ttf|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]',
                },
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
    ],
};
