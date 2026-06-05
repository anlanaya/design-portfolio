import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://your-domain.com',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
