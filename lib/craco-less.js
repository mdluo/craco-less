const path = require('path');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const overrideWebpackConfig = ({
  context,
  webpackConfig,
  pluginOptions = {},
}) => {
  const {
    getLoader,
    loaderByName,
    throwUnexpectedConfigError,
  } = require('@craco/craco');

  const getStyleLoaders = require('./getStyleLoaders')(
    context.env,
    pluginOptions,
  );

  const isEnvDevelopment = context.env === 'development';
  const isEnvProduction = context.env === 'production';

  const throwError = (message, githubIssueQuery) =>
    throwUnexpectedConfigError({
      packageName: 'craco-less',
      githubRepo: 'DocSpring/craco-less',
      message,
      githubIssueQuery,
    });

  const lessRegex = /\.less$/;
  const lessModuleRegex = /\.module\.less$/;

  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (!oneOfRule) {
    throwError(
      "Can't find a 'oneOf' rule under module.rules in the " +
        `${context.env} webpack config!`,
      'webpack+rules+oneOf',
    );
  }

  // Based on the SASS rule from `react-scripts`: https://git.io/JGjxH
  let lessRule = {
    test: lessRegex,
    exclude: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 3,
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
      },
      'less-loader',
    ),
    sideEffects: true,
  };

  // Based on the SASS Modules rule from `react-scripts`: https://git.io/JGjpe
  let lessModuleRule = {
    test: lessModuleRegex,
    use: getStyleLoaders(
      {
        importLoaders: 3,
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        modules: {
          getLocalIdent: getCSSModuleLocalIdent,
        },
      },
      'less-loader',
    ),
  };

  if (pluginOptions.modifyLessRule) {
    lessRule = pluginOptions.modifyLessRule(lessRule, context);
  }
  oneOfRule.oneOf.push(lessRule);

  if (pluginOptions.modifyLessModuleRule) {
    lessModuleRule = pluginOptions.modifyLessModuleRule(
      lessModuleRule,
      context,
    );
  }
  oneOfRule.oneOf.push(lessModuleRule);

  const { isFound, match: fileLoaderMatch } = getLoader(
    webpackConfig,
    loaderByName('file-loader'),
  );
  if (!isFound) {
    throwError(
      `Can't find file-loader in the ${context.env} webpack config!`,
      'webpack+file-loader',
    );
  }
  fileLoaderMatch.loader.exclude.push(lessRegex, lessModuleRegex);

  return webpackConfig;
};

// pathSep is mocked in Windows tests
module.exports = {
  overrideWebpackConfig,
  pathSep: path.sep,
};
