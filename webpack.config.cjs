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
        target: 'node',
        mode: 'production',
        devtool: 'source-map',
        stats: {
            errorDetails: true
        },


        externals: [
            nodeExternals({
                allowlist: []
            })
        ],

        plugins: [
            ...(options.plugins || []),
            new CopyPlugin({
                patterns: [
                    {
                        from: '**/*.{yaml,yml,json}',
                        to: '[path][name][ext]',
                        context: 'src',
                        noErrorOnMissing: true,
                        globOptions: {
                            ignore: ['**/tsconfig.json', '**/package.json']
                        }
                    }
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
                        compress: {
                            drop_console: false,
                            keep_classnames: true,
                            keep_fnames: true
                        },
                        format: {
                            comments: false
                        }
                    },
                    extractComments: false
                })
            ],
            runtimeChunk: false,
            splitChunks: false
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            extensionAlias: {
                '.js': ['.ts', '.js'],
                '.cjs': ['.cts', '.cjs'],
                '.mjs': ['.mts', '.mjs']
            },
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: './tsconfig.json',
                    extensions: ['.ts', '.tsx', '.js'],
                    mainFields: ['module', 'main']
                })
            ]

        },


        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        transpileOnly: true,
                        configFile: 'tsconfig.json'
                    }
                }
            ]
        },

        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        }
    };
};
