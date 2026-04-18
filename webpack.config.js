var webpack = require("webpack");
var path = require('path');

var proxyTarget = process.env.WEBPACK_PROXY_TARGET || 'http://localhost:3000/';

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractBootstrap = new ExtractTextPlugin("css/bootstrap.css");
const extractSass = new ExtractTextPlugin("css/main.css");


module.exports = {
    entry: {
        app: './src/modules/js/app.js',
        admin: './src/modules/js/admin.js',
        vendor: ['angular', 'angular-route', 'angular-resource', 'bootstrap']
    },
    output: {
        path: path.join(__dirname, "/app/build"),
        filename: 'js/[name].js',
        publicPath: "/build"
    },

    devServer: {
        contentBase: path.join(__dirname, "/app"),
        host: "0.0.0.0",
        compress: true,
        port: 8093,
        proxy: {
            '/': proxyTarget,
        },
        watchOptions: {
            aggregateTimeout: 500,
        },
    },
    devtool: "source-map",

    module: {
        rules: [
            {
                test: /\.css$/,
                //use: [ 'style-loader', 'css-loader' ]
                use: extractBootstrap.extract({
                    use: "css-loader"
                })
                //use: ['file-loader?name=css/[name].[ext]']
            },
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
                        { loader: "css-loader", options: { sourceMap: true } },
                        { loader: "sass-loader", options: { sourceMap: true } }
                    ],
                })
            },
            {
                test: /\.(woff2?|eot|ttf|svg)$/,
                //use: [ 'url-loader']
                use: ["file-loader?name=/fonts/[name].[ext]"]
            }
        ]
    },

    plugins: [
        extractSass,
        extractBootstrap,
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        })

    ]
}
