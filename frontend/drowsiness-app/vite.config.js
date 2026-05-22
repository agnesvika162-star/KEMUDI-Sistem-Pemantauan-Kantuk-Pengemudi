import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react()],
})

// export default ({ mode }) => {
//   process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

//   // import.meta.env.VITE_NAME available here with: process.env.VITE_NAME
//   // import.meta.env.VITE_PORT available here with: process.env.VITE_PORT

//   // const plugins = mode === 'development' ? [reactRefresh()] : [];
//   return defineConfig({
//     plugins: [react()],
//     // publicDir: 'src/assets',
//     // resolve: {
//     //   alias: aliases,
//     // },
//     // build: {
//     //   chunkSizeWarningLimit: 1500,
//     // },
//   });
// };
