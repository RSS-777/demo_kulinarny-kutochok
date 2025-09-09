import express from 'express'
import { generateSitemap, getCachedSitemap } from '../utils/sitemapGenerator.js'
import logger from '../logger/logger.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res) => {
  try {
    let sitemap = getCachedSitemap()

    if (!sitemap) {
      sitemap = await generateSitemap()
      if (!sitemap) {
        return res.status(500).send('[sitemapRoutes] Failed to generate sitemap')
      }
    }

    res.header('Content-Type', 'application/xml')
    res.send(sitemap)
  } catch (error) {
    logger.error('[sitemapRoutes] Error in sitemap route.')
    res.status(500).send('[sitemapRoutes] Server error')
  }
})

export default router