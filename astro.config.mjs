import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { astroImageTools } from "astro-imagetools";

// https://astro.build/config
export default defineConfig(
/** @type {import('astro').AstroUserConfig} */
{
  markdown: {
    remarkPlugins: ['remark-gfm', 'remark-smartypants'],
    rehypePlugins: ['rehype-slug', ['rehype-autolink-headings', {
      behavior: 'prepend'
    }]],
    shikiConfig: {
      theme: 'poimandres',
      langs: [],
      wrap: false
    }
  },
  site: 'http://0.0.0.0:3000/',
  experimental: {
    integrations: true
  },
  integrations: [sitemap(), astroImageTools]
});
