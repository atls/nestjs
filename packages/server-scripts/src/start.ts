import chalk                          from 'chalk'
import webpack                        from 'webpack'
import { createCompiler }             from 'react-dev-utils/WebpackDevServerUtils'

import { createWebpackConfig, paths } from './config'

process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

process.on('unhandledRejection', err => {
  throw err
})

export const bootstrap = async () => {
  const config = await createWebpackConfig('development')
  // eslint-disable-next-line
  const appName = require(paths.appPackageJson).name
  const compiler = createCompiler({
    webpack,
    config,
    appName,
    useYarn: true,
    urls: {},
  } as any)
  // eslint-disable-next-line
  const watching = compiler.watch({}, error => {
    if (error) {
      return console.log(error)
    }
    console.log(chalk.cyan('Starting the development server...\n'))
  })
  return watching
}

const handleSignals = watching => {
  process.on('SIGINT', () => {
    watching.close()
    process.exit()
  })
  process.on('SIGTERM', () => {
    watching.close()
    process.exit()
  })
}
const handleErrors = err => {
  if (err && err.message) {
    console.log(err.message)
  }
  process.exit(1)
}

bootstrap()
  .then(handleSignals)
  .catch(handleErrors)
