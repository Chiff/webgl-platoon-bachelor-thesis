const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: path.resolve('./', 'main.js'),
    output: {
        path: path.resolve('dist'),
        filename: 'bundle.js'
    },
    resolve: {
        modules: [
            path.resolve('src'),
            'node_modules'
        ]
    },
    externals: {
        $: 'jQuery'
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: '**/**.*', context: 'assets', to: 'assets'},
            {from: '**/*.{html,css}', context: './', ignore: ['**/node_modules/**']}
        ])
    ]
};
