import { test, expect } from '@playwright/test'

/*
  Uma única costura, no ponto mais alto: navegador real contra o build de
  produção. Teste de componente aqui seria rede de segurança falsa — montar os
  componentes isoladamente passa com a animação inteiramente quebrada, e a
  animação é o projeto.

  Toda asserção é sobre o que a pessoa vê e consegue fazer. "O centro do logo
  coincide com o centro do slot" é comportamento externo; "a timeline tem a
  posição 0.62" é detalhe de implementação e não aparece aqui.
*/

const LOADER_MS = 2500
const EXPAND_MS = 1400
const SETTLE_MS = 900 // o scrub tem inércia (scrub: 0.6)

const ready = async (page) => {
  await page.goto('/')
  await page.waitForTimeout(LOADER_MS + EXPAND_MS)
}

const scrollToProgress = async (page, q) => {
  const h = page.viewportSize().height
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * q))
  await page.waitForTimeout(SETTLE_MS)
}

const boxes = (page) =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, w: b.width, h: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 }
    }
    const logo = document.querySelector('.logo-hero')
    const slot = document.querySelector('[data-slot]')
    const heading = document.querySelector('h1')
    const capsule = slot?.offsetParent
    return {
      logo: r(logo),
      slot: r(slot),
      heading: r(heading),
      capsule: r(capsule),
      capsuleOpacity: capsule ? Number(getComputedStyle(capsule.parentElement).opacity) : 0,
    }
  })

test.describe('link-in-bio', () => {
  test('o logo pousa exatamente no slot da cápsula', async ({ page }) => {
    await ready(page)
    await scrollToProgress(page, 1)

    const { logo, slot } = await boxes(page)
    expect(Math.abs(logo.cx - slot.cx)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(logo.cy - slot.cy)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(logo.w - slot.w)).toBeLessThanOrEqual(1.5)
  })

  test('o logo nunca cobre o nome dentro da cápsula', async ({ page }) => {
    // Regressão do bug de compressão da timeline: com o stagger esticando a
    // duração total, tudo disparava cedo e o logo, ainda grande e centralizado,
    // passava por cima do próprio título.
    await ready(page)

    for (const q of [0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
      await scrollToProgress(page, q)
      const { logo, heading, capsuleOpacity } = await boxes(page)
      if (capsuleOpacity < 0.05) continue

      const overlaps =
        logo.x < heading.x + heading.w &&
        logo.x + logo.w > heading.x &&
        logo.y < heading.y + heading.h &&
        logo.y + logo.h > heading.y
      
      if (overlaps) {
        console.log(`Overlap at ${q}: logo(y:${logo.y}, h:${logo.h}) heading(y:${heading.y}, h:${heading.h})`)
      }
      expect(overlaps, `logo cobre o nome em progresso ${q}`).toBe(false)
    }
  })

  test('a cápsula só aceita toque depois do encaixe', async ({ page }) => {
    await ready(page)

    const agendar = page.getByRole('link', { name: 'Agendar' })
    const hitsLink = () =>
      agendar.evaluate((el) => {
        const b = el.getBoundingClientRect()
        const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
        return el.contains(hit)
      })

    expect(await hitsLink(), 'link alcançável no herói').toBe(false)

    await scrollToProgress(page, 1)
    expect(await hitsLink(), 'link inalcançável no estado final').toBe(true)
  })

  test('os destinos apontam para os lugares certos', async ({ page }) => {
    await ready(page)
    await scrollToProgress(page, 1)

    const href = (name) => page.getByRole('link', { name, exact: true }).getAttribute('href')

    expect(await href('Agendar')).toBe('https://wa.me/5519971502747')
    expect(await href('Site')).toBe('https://charlington.com.br/')

    const groupsBtn = page.getByRole('button', { name: 'Grupos', exact: true })
    await expect(groupsBtn).toBeVisible()

    const social = (label) =>
      page.getByRole('link', { name: new RegExp(label, 'i') }).getAttribute('href')
    expect(await social('Doctoralia')).toContain('doctoralia.com.br')
    expect(await social('Instagram')).toContain('instagram.com/charlington.cavalcante')
    expect(await social('LinkedIn')).toContain('linkedin.com/in/')

    // Navega para a visão de endereços
    await page.getByRole('button', { name: 'Endereços' }).click()

    const campinas = decodeURIComponent(await href('Campinas'))
    expect(campinas).toContain('google.com/maps')
    expect(campinas).toContain('José Rocha Bonfim, 214')

    const fortaleza = decodeURIComponent(await href('Fortaleza'))
    expect(fortaleza).toContain('Pontes Vieira, 2340')
  })

  test('o CRM aparece na cápsula e no herói', async ({ page }) => {
    await ready(page)
    await expect(page.getByText(/CRM-CE 14\.212/).first()).toBeVisible()

    await scrollToProgress(page, 1)
    await expect(page.getByText(/CRM-CE 14\.212/).last()).toBeVisible()
  })

  test('o botão circular devolve ao herói', async ({ page }) => {
    await ready(page)
    await scrollToProgress(page, 1)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(10)

    await page.getByRole('button', { name: /voltar ao topo/i }).click()
    await page.waitForTimeout(2000)
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)
  })

  test('todo alvo clicável tem ao menos 44px de altura', async ({ page }) => {
    await ready(page)
    await scrollToProgress(page, 1)

    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button')]
        .filter((el) => el.getBoundingClientRect().height > 0)
        .map((el) => ({
          t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24),
          h: Math.round(el.getBoundingClientRect().height),
        }))
        .filter((x) => x.h < 44),
    )
    expect(small).toEqual([])
  })

  test('movimento reduzido entra direto no estado final', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForTimeout(800)

    const { docH, viewH } = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      viewH: window.innerHeight,
    }))
    expect(docH).toBeLessThanOrEqual(viewH + 2)

    await expect(page.getByRole('link', { name: 'Agendar' })).toBeVisible()
    const { logo, slot } = await boxes(page)
    expect(Math.abs(logo.cy - slot.cy)).toBeLessThanOrEqual(1.5)
  })

  test('nenhum erro de console em nenhum estado', async ({ page }) => {
    const errs = []
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    page.on('pageerror', (e) => errs.push(String(e)))

    await ready(page)
    for (const q of [0.4, 0.8, 1]) await scrollToProgress(page, q)

    expect(errs).toEqual([])
  })
})
