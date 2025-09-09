import Recipe from "../models/Recipe.js";
import logger from "../logger/logger.js";

let cachedSitemap: string | null = null;
let lastGenerated: Date | null = null;

export async function generateSitemap() {
  try {
    const recipes = await Recipe.find({}, "_id createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const recipesUrls = recipes
      .map(
        (recipe) => `
  <url>
    <loc>https://kulinarny-kutochok.com.ua/recipe/${recipe._id}</loc>
    <lastmod>${recipe.createdAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <url>
    <loc>https://kulinarny-kutochok.com.ua/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
    <url>
    <loc>https://kulinarny-kutochok.com.ua/rules</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://kulinarny-kutochok.com.ua/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  ${recipesUrls}
</urlset>`;

    cachedSitemap = xml;
    lastGenerated = new Date();

    return xml;
  } catch (error) {
    logger.error("[sitemapGenerator] Error generating sitemap.");
    return null;
  }
};

export function getCachedSitemap() {
  return cachedSitemap;
};

export function getLastGenerated() {
  return lastGenerated;
};
