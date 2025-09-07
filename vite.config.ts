import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url';
// Plugin to inject title from env
function htmlTitlePlugin() {
  return {
    name: 'html-title-plugin',
    transformIndexHtml(html: string) {
      const title = process.env.VITE_APP_TITLE || 'Spacevault Exchange';
      return html.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    htmlTitlePlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  envPrefix: 'VUE_APP',
  server: {
    port: 3500,
    host: true,
    allowedHosts: true,
  }
})
