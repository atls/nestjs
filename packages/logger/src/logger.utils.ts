import { join } from 'path'

export const getRootPackage = (): any => {
  try {
    const packagePath = join(process.cwd(), 'package.json')
    // eslint-disable-next-line
    return require(packagePath)
  } catch (error) {
    console.log(error)
    return null
  }
}

export const getCloudLogginServiceContext = (): {
  service: any
  version: any
} | null => {
  const rootPackage = getRootPackage()

  if (!(rootPackage && rootPackage.name)) {
    return null
  }

  return {
    service: rootPackage.name,
    version: rootPackage.version,
  }
}
