const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const common = require('./webpack.config.js');

/* eslint-disable camelcase */
module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin([
            'dist'
        ], {
            root: path.resolve(__dirname, '../')
        })
    ]
});
