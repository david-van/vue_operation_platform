import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'
// 引入 svg 需要用到的插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// 引入 mock 插件
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 获取各种环境下对应的变量
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      viteMockServe({
        localEnabled: command === 'serve', // 保证开发阶阶段能够使用mock接口
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // scss 全局变量的配置
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: '@import "./src/styles/variable.scss";',
        },
      },
    },
    // 代理跨域
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          // 获取数据的服务器地址设置
          target: env.VITE_SERVE,
          // 需要代理跨域
          changeOrigin: true,
          // 路径重写
          rewrite: (path) => {
            console.log('Original path:', path)
            // 如果路径以/结尾，去掉这个/
            path = path.replace(/^\/api/, '')
            const [pathname, search] = path.split('?')
            // 移除路径末尾的斜杠（如果有）
            // 重新拼接路径和查询参数
            let newPath = pathname.replace(/\/+$/, '')
            if (search) {
              newPath += '?' + search
            }
            console.log('Rewritten path:', newPath)
            return newPath
          },
        },
      },
    },
  }
})
