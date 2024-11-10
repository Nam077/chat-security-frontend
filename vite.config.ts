import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Lắng nghe trên tất cả các địa chỉ IP
    port: 3001,       // Cổng bạn muốn mở
  }
})
