import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    host: true, // Lắng nghe trên mọi địa chỉ IP (sửa lỗi HMR WebSocket qua mạng nội bộ)
  }
})
