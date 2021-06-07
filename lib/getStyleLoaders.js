const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssNormalize = require('postcss-normalize');
const paths = require('react-scripts/config/paths');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = function (webpackEnv, pluginOptions = {}) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // common function to get style loaders
  // modified based on `react-scripts/config/webpack.config.js`
  // with extra options passed from `pluginOptions` to apply to each loaders
  // original definition: https://git.io/JGjMu
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && {
        loader: require.resolve('style-loader'),
        options: pluginOptions.styleLoaderOptions || {},
      },
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: {
          ...(paths.publicUrlOrPath.startsWith('.')
            ? { publicPath: '../../' }
            : {}),
          ...pluginOptions.miniCssExtractPluginOptions,
        },
      },
      {
        loader: require.resolve('css-loader'),
        options: {
          ...cssOptions,
          ...pluginOptions.cssLoaderOptions,
        },
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              require('postcss-flexbugs-fixes'),
              [
                require('postcss-preset-env'),
                {
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                },
              ],
              // Adds PostCSS Normalize as the reset css with default options,
              // so that it honors browserslist config in package.json
              // which in turn let's users customize the target behavior as per their needs.
              postcssNormalize(),
            ],
          },
          sourceMap: isEnvProduction && shouldUseSourceMap,
          ...pluginOptions.postcssLoaderOptions,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc,
            ...pluginOptions.resolveUrlLoaderOptions,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
            ...pluginOptions.lessLoaderOptions,
          },
        },
      );
    }
    return loaders;
  };

  return getStyleLoaders;
};
