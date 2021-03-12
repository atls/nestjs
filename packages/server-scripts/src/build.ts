import chalk                          from 'chalk'
import formatMessagesWebpack          from 'react-dev-utils/formatWebpackMessages'
import printBuildError                from 'react-dev-utils/printBuildError'
import webpack                        from 'webpack'
import { createCompiler }             from 'react-dev-utils/WebpackDevServerUtils'

import { createWebpackConfig, paths } from './config'

process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

process.on('unhandledRejection', err => {
  // eslint-disable-next-line
  throw err
})

const bootstrap = async () => {
  const config = await createWebpackConfig('production')
  // eslint-disable-next-line
  const appName = require(paths.appPackageJson).name
  const compiler = createCompiler({
    webpack,
    config,
    appName,
    useYarn: true,
    urls: {},
  } as any)

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      let messages
      if (error) {
        if (!error.message) {
          return reject(error)
        }
        messages = formatMessagesWebpack({
          errors: [error.message],
          warnings: [],
        })
      } else {
        messages = formatMessagesWebpack(stats.toJson({ all: false, warnings: true, errors: true }))
      }
      if (messages.errors.length) {
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        return reject(new Error(messages.errors.join('\n\n')))
      }
      return resolve({
        stats,
        warnings: messages.warnings,
      })
    })
  })
}

const handleStat = ({ warnings }) => {
  if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'))
    console.log(warnings.join('\n\n'))
    console.log(
      `\nSearch for the ${chalk.underline(
        chalk.yellow('keywords'),
      )} to learn more about each warning.`,
    )
    console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`)
  } else {
    console.log(chalk.green('Compiled successfully.\n'))
  }
}
const handleErrors = error => {
  console.log(chalk.red('Failed to compile.\n'))
  printBuildError(error)
  process.exit(1)
}
bootstrap()
  .then(handleStat)
  .catch(handleErrors)
