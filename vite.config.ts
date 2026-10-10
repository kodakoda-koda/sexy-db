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
        name: '推しセクシー女優コレクション',
        short_name: '推し女優コレクション',
        description: '推しのセクシー女優を登録して散布図で眺める自分用コレクション',
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
