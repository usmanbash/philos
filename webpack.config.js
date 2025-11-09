const path = require('path');
const glob = require('glob');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const mode = process.env.NODE_ENV || 'production';
const isDev = mode !== 'production';

module.exports = {
  mode,

  entry: glob.sync('./src/**/*.js').reduce((acc, path) => {
    const entry = path.replace(/^.*[\\\/]/, '').replace('.js', '');
    acc[entry] = path;
    return acc;
  }, {}),
  output: {
    filename: './assets/[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    minimize: !isDev,
  },
  watchOptions: {
    poll: false,
    ignored: ['**/node_modules', '**/dist', '**/.git'],
    aggregateTimeout: 300,
    followSymlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: isDev,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              api: 'modern',
              sourceMap: isDev,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './assets/[name].css',
    }),
    new ESLintPlugin({
      fix: true,
      cache: true,
      emitWarning: isDev,
      failOnError: !isDev,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/assets/**/*',
          to: 'assets/[name][ext]',
        },
        {
          from: 'src/config/*.json',
          to: 'config/[name][ext]',
        },
        {
          from: 'src/locales/*.json',
          to: 'locales/[name][ext]',
        },
        {
          from: 'src/components/**/*.liquid',
          to({ absoluteFilename }) {
            const relativePath = path.join(__dirname, 'src/components');
            const diff = path.relative(relativePath, absoluteFilename);
            const targetFolder = diff.startsWith('templates/customers/')
              ? 'templates/customers/'
              : diff.split(path.sep)[0];

            return path.join(targetFolder, path.basename(absoluteFilename));
          },
        },
        {
          from: 'src/components/**/*.json',
          to({ absoluteFilename }) {
            const relativePath = path.join(__dirname, 'src/components');
            const diff = path.relative(relativePath, absoluteFilename);
            const targetFolder = diff.startsWith('templates/customers/')
              ? 'templates/customers/'
              : diff.split(path.sep)[0];
            return path.join(targetFolder, path.basename(absoluteFilename));
          },
        },
      ],
      options: {
        concurrency: 100, // Increase copy performance
      },
    }),
    new Dotenv(),
  ],
  resolve: {
    extensions: ['.js', '.json', '.scss'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
