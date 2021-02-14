import { HotModuleReplacementPlugin } from 'webpack'

import { createWebpackConfig }        from '../src/config'

describe('Server Scripts Webpack', () => {
  describe('createWebpackConfig', () => {
    it('should create webpack config with dev env', async () => {
      const webPackConfig = await createWebpackConfig('production')
      expect(webPackConfig.mode).toBe('production')
      expect(webPackConfig.plugins).toStrictEqual([])
    })
    it('should create webpack config with production env', async () => {
      const webPackConfig = await createWebpackConfig('development')
      expect(webPackConfig.mode).toBe('development')
      expect(webPackConfig.plugins).toContainEqual(new HotModuleReplacementPlugin())
    })
  })
})
