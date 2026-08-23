import { defineConfig } from '@playwright/test'

const PORT = 5181
const BASE = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  // A coreografia tem piso de 2,5s de loader; um teste raramente é rápido aqui.
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    // O fundo é WebGL: headless precisa de rasterizador por software.
    launchOptions: {
      args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  // Chromium nos dois: o fundo depende de WebGL por software, e os presets de
  // dispositivo do Playwright puxariam WebKit.
  projects: [
    {
      name: 'mobile',
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
    },
  ],
  // Roda contra o build de produção, não o servidor de desenvolvimento: é o
  // artefato que vai ao ar que precisa estar correto.
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
