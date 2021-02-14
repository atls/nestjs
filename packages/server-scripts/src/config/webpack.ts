import StartServerWebpackPlugin       from 'start-server-webpack-plugin'
import glob                           from 'glob-promise'
import nodeExternals                  from 'webpack-node-externals'
import { HotModuleReplacementPlugin } from 'webpack'
import { join, relative }             from 'path'

import { getPackages }                from '@lerna/project'

import paths                          from './paths'

export const createWebpackConfig = async webpackEnv => {
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'
  const packages = await getPackages(process.cwd())
  const workspaces = packages.map(({ name }) => new RegExp(name))
  const configs = await glob(join(paths.appConfigsPath, '**/*.ts'))
  const configEntries = configs.reduce(
    (result, config) => ({
      ...result,
      [relative(paths.appSrc, config).replace('.ts', '')]: [
        isEnvDevelopment && 'webpack/hot/poll?100',
        config,
      ].filter(Boolean),
    }),
    {}
  )
  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    bail: isEnvProduction,
    target: 'node',
    entry: {
      index: [isEnvDevelopment && 'webpack/hot/poll?100', paths.appIndex].filter(Boolean),
      ...configEntries,
    },
    output: {
      path: paths.appBuild,
      pathinfo: isEnvDevelopment,
      libraryTarget: 'commonjs',
      filename: '[name].js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
      ],
    },
    externals: [
      nodeExternals({
        allowlist: [...workspaces, 'webpack/hot/poll?100'],
      }),
      nodeExternals({
        modulesDir: paths.rootNodeModules,
        allowlist: [...workspaces, 'webpack/hot/poll?100'],
      }),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      isEnvDevelopment && new HotModuleReplacementPlugin(),
      isEnvDevelopment &&
        new StartServerWebpackPlugin({
          name: 'index.js',
          nodeArgs: ['--require=ts-node/register'],
        }),
    ].filter(Boolean),
    node: {
      __dirname: false,
    },
    optimization: {
      minimize: false,
    },
  }
}
