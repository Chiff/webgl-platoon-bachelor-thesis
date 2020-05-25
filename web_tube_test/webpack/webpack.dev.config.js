const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer:
        {
            port: 8080,
            open: true,
            contentBase: path.resolve('dist'),
            watchContentBase: true
        }
});
