const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = function (options) {
    return {
        ...options,
        entry: {
            main: './main.ts'
        },
        mode: 'production',
        devtool: 'source-map',
        externals: [nodeExternals({ allowlist: [] })],

        plugins: [
            ...options.plugins,
            new CopyPlugin({
                patterns: [
                    { from: '**/*.yaml', to: 'defaults/[name][ext]', context: 'src', noErrorOnMissing: true },
                    { from: '**/*.yml', to: 'defaults/[name][ext]', context: 'src', noErrorOnMissing: true }
                ]
            }),
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            })
        ],

        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                        keep_fnames: true,
                        compress: { drop_console: false },
                        format: { comments: false }
                    },
                    extractComments: false
                })
            ],
            runtimeChunk: false,
            splitChunks: false
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })]
        },

        module: {
            rules: [{ test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/, options: { transpileOnly: true } }]
        },

        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        }
    };
};
