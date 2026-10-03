import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// VITE_BASE: サブパス配信(GitHub Pages など)のとき "/sexy-db/" のように指定。既定はルート。
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'sexy-db',
        short_name: 'sexy-db',
        description: '自分用の女優 DB',
        theme_color: '#c2185b',
        background_color: '#faf7f8',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // Supabase への通信はキャッシュしない
        navigateFallbackDenylist: [/^\/auth/],
        runtimeCaching: [],
      },
    }),
  ],
})
