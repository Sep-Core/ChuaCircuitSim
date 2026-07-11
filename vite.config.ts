import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/ChuaCircuitSim/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
}))
