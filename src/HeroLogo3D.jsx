import { useEffect, useRef, useState, memo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'

/*
  Logo do herói como objeto de vidro.

  Três coisas que não são óbvias e que custaram medição, não palpite:

  1. Uma extrusão tem faces de entrada e saída PARALELAS, e faces paralelas
     cancelam o desvio da luz. De frente, ela não refrata nada — o núcleo sai
     nítido até a borda e o resultado é logo com chanfro e verniz, não vidro.
     Por isso `domeFrontCap` subdivide a tampa frontal e a abaula de fato.
     Mapa de normais NÃO resolve: muda o sombreamento, não inclina o vetor de
     refração. Isso foi testado e reprovado.

  2. `transmission` amostra o alvo de render do passe de transmissão, que contém
     apenas objetos OPACOS. Por isso o núcleo colorido tem `transparent: false`:
     é a única forma de a casca enxergá-lo e refratá-lo. Marcar o núcleo como
     transparente o tira do passe e o vidro deixa de vê-lo.

  3. O canvas é transparente e o Prism vive em OUTRO canvas, atrás, no DOM. Sem
     backdrop, a casca refrataria o vazio e leria como cinza morto sobre a
     página clara. O plano de backdrop existe SÓ dentro do passe de transmissão
     (ver `uMainPass`): o vidro tem o que entortar e o canvas continua
     transparente, com o Prism do DOM aparecendo normalmente.

  O `Prism` do DOM escreve alpha por pixel com blend desligado, então o
  `#F1F1EF` do body atravessa. O backdrop reproduz essa composição — sem isso o
  campo refratado fica escuro demais e o vidro refrata uma página que não existe.
*/

/* ── ambiente de estúdio: idêntico ao componente atual ──────────────────── */
const ROOM_BLOCKS = [
  { position: [-10.906, -1, 1.846], rotation: [0, -0.195, 0], scale: [2.328, 7.905, 4.651] },
  { position: [-5.607, -0.754, -0.758], rotation: [0, 0.994, 0], scale: [1.97, 1.534, 3.955] },
  { position: [6.167, -0.16, 7.803], rotation: [0, 0.561, 0], scale: [3.927, 6.285, 3.687] },
  { position: [-2.017, 0.018, 6.124], rotation: [0, 0.333, 0], scale: [2.002, 4.566, 2.064] },
  { position: [2.291, -0.756, -2.621], rotation: [0, -0.286, 0], scale: [1.546, 1.552, 1.496] },
  { position: [-2.193, -0.369, -5.547], rotation: [0, 0.516, 0], scale: [3.875, 3.487, 2.986] },
]
const ROOM_FORMERS = [
  { kind: 'ring', intensity: 15, position: [2, 3, -2], scale: [10, 10, 10], lookAtCenter: true },
  { kind: 'box', intensity: 80, position: [-14, 10, 8], scale: [0.1, 2.5, 2.5] },
  { kind: 'box', intensity: 80, position: [-14, 14, -4], scale: [0.1, 2.5, 2.5], withLight: true },
  { kind: 'box', intensity: 23, position: [14, 12, 0], scale: [0.1, 5, 5], withLight: true },
  { kind: 'box', intensity: 16, position: [0, 9, 14], scale: [5, 5, 0.1], withLight: true },
  { kind: 'box', intensity: 80, position: [7, 8, -14], scale: [2.5, 2.5, 0.1], withLight: true },
  { kind: 'box', intensity: 80, position: [-7, 16, -14], scale: [2.5, 2.5, 0.1], withLight: true },
  { kind: 'box', intensity: 1, position: [0, 20, 0], scale: [0.1, 0.1, 0.1], withLight: true },
  { kind: 'box', intensity: 20, position: [0, 15, 0], scale: [10, 1, 10], withLight: true },
]

const CAMERA_DIR = new THREE.Vector3(0, -1, 4).normalize()
const MODEL_LIFT = 0.3
const BACKDROP_DISTANCE = 30
const RASTER_SIZE = 2048
const ALPHA_CUTOFF = 240
const MIN_AREA = 6
const MAX_CONTOURS = 64


function sniffKind(bytes) {
  if (bytes.length < 4) return null
  const ascii = (start, text) => {
    for (let i = 0; i < text.length; i++) {
      if (bytes[start + i] !== text.charCodeAt(i)) return false
    }
    return true
  }
  if (bytes[0] === 0x89 && ascii(1, 'PNG')) return 'bitmap'
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'bitmap'
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return 'bitmap'
  if (ascii(0, 'GIF8')) return 'bitmap'
  let head = ''
  try {
    head = new TextDecoder().decode(bytes.subarray(0, 2048)).replace(/^\uFEFF/, '').trimStart()
  } catch {
    return null
  }
  if (head.startsWith('<')) return head.includes('<svg') ? 'svg' : null
  return null
}

/* ── traçado do SVG: marching squares, igual ao componente atual ────────── */
function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}
function drawToCanvas(src, w, h) {
  const c = makeCanvas(w, h)
  const x = c.getContext('2d')
  x.drawImage(src, 0, 0, c.width, c.height)
  return c
}
function decodeWithImage(blob) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob)
    const im = new Image()
    im.onload = () => { URL.revokeObjectURL(url); res(im) }
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')) }
    im.src = url
  })
}
async function decodeImage(blob) {
  const im = await decodeWithImage(blob)
  const w = im.naturalWidth || RASTER_SIZE
  const h = im.naturalHeight || RASTER_SIZE
  const s = RASTER_SIZE / Math.max(w, h, 1)
  return drawToCanvas(im, w * s, h * s)
}

function traceContours(inside, width, height) {
  const seg = []
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const b = y * width + x
      const code = inside[b] | (inside[b + 1] << 1) | (inside[b + width + 1] << 2) | (inside[b + width] << 3)
      if (code === 0 || code === 15) continue
      const t = x + 0.5, r = y + 0.5
      switch (code) {
        case 1: case 14: seg.push(x, r, t, y); break
        case 2: case 13: seg.push(t, y, x + 1, r); break
        case 3: case 12: seg.push(x, r, x + 1, r); break
        case 4: case 11: seg.push(x + 1, r, t, y + 1); break
        case 6: case 9: seg.push(t, y, t, y + 1); break
        case 7: case 8: seg.push(x, r, t, y + 1); break
        case 5: seg.push(x, r, t, y, x + 1, r, t, y + 1); break
        default: seg.push(t, y, x + 1, r, x, r, t, y + 1); break
      }
    }
  }
  const count = seg.length / 4
  const stride = width * 2 + 1
  const ends = new Map()
  const keyAt = (i) => seg[i * 2 + 1] * 2 * stride + seg[i * 2] * 2
  for (let i = 0; i < count; i++) {
    for (const e of [i * 2, i * 2 + 1]) {
      const k = keyAt(e)
      const bucket = ends.get(k)
      if (bucket) bucket.push(i); else ends.set(k, [i])
    }
  }
  const used = new Uint8Array(count)
  const out = []
  for (let s = 0; s < count; s++) {
    if (used[s]) continue
    const pts = []
    let cur = s, x = seg[s * 4], y = seg[s * 4 + 1]
    while (cur >= 0 && !used[cur]) {
      used[cur] = 1
      const h = cur * 4
      const fwd = seg[h] === x && seg[h + 1] === y
      x = fwd ? seg[h + 2] : seg[h]
      y = fwd ? seg[h + 3] : seg[h + 1]
      pts.push(x, y)
      const bucket = ends.get(y * 2 * stride + x * 2)
      let next = -1
      if (bucket) for (const c of bucket) if (!used[c]) { next = c; break }
      cur = next
    }
    if (pts.length >= 8) out.push(pts)
  }
  return out
}

function simplify(pts, tol) {
  const n = pts.length / 2
  if (n < 4) return pts
  const keep = new Uint8Array(n)
  keep[0] = keep[n - 1] = 1
  const stack = [0, n - 1]
  const t2 = tol * tol
  while (stack.length) {
    const last = stack.pop(), first = stack.pop()
    if (last - first < 2) continue
    const ax = pts[first * 2], ay = pts[first * 2 + 1]
    const dx = pts[last * 2] - ax, dy = pts[last * 2 + 1] - ay
    const L = dx * dx + dy * dy
    let far = -1, farSq = t2
    for (let i = first + 1; i < last; i++) {
      const px = pts[i * 2] - ax, py = pts[i * 2 + 1] - ay
      const t = L > 0 ? (px * dx + py * dy) / L : 0
      const c = t < 0 ? 0 : t > 1 ? 1 : t
      const ox = px - dx * c, oy = py - dy * c
      const d = ox * ox + oy * oy
      if (d > farSq) { far = i; farSq = d }
    }
    if (far < 0) continue
    keep[far] = 1
    stack.push(first, far, far, last)
  }
  const res = []
  for (let i = 0; i < n; i++) if (keep[i]) res.push(pts[i * 2], pts[i * 2 + 1])
  return res
}

function ringArea(p) {
  let a = 0
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) a += (p[j] - p[i]) * (p[j + 1] + p[i + 1])
  return Math.abs(a) / 2
}
function ringContains(p, x, y) {
  let inside = false
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const yi = p[i + 1], yj = p[j + 1]
    if (yi > y === yj > y) continue
    const t = (y - yi) / (yj - yi)
    if (x < p[i] + t * (p[j] - p[i])) inside = !inside
  }
  return inside
}

function buildShapes(canvas, aw, ah, traceSize, tol) {
  const s = Math.min(1, traceSize / Math.max(canvas.width, canvas.height, 1))
  const trace = s < 1 ? drawToCanvas(canvas, canvas.width * s, canvas.height * s) : canvas
  const ctx = trace.getContext('2d', { willReadFrequently: true })
  const tw = trace.width, th = trace.height
  const data = ctx.getImageData(0, 0, tw, th).data
  const W = tw + 2, H = th + 2
  const inside = new Uint8Array(W * H)
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      inside[(y + 1) * W + x + 1] = data[(y * tw + x) * 4 + 3] >= ALPHA_CUTOFF ? 1 : 0
    }
  }
  const rings = traceContours(inside, W, H)
    .map((p) => simplify(p, tol))
    .filter((p) => p.length >= 6 && ringArea(p) >= MIN_AREA)
    .map((p) => ({ points: p, area: ringArea(p), depth: 0 }))
    .sort((a, b) => b.area - a.area)
    .slice(0, MAX_CONTOURS)

  for (const r of rings) {
    for (const o of rings) {
      if (o !== r && o.area > r.area && ringContains(o.points, r.points[0], r.points[1])) r.depth++
    }
  }
  const toPath = (p) => {
    const out = []
    for (let i = 0; i < p.length; i += 2) {
      out.push(new THREE.Vector2(((p[i] - 0.5) / tw) * aw, (1 - (p[i + 1] - 0.5) / th) * ah))
    }
    return out
  }
  const shapes = new Map()
  for (const r of rings) if (r.depth % 2 === 0) shapes.set(r, new THREE.Shape(toPath(r.points)))
  for (const r of rings) {
    if (r.depth % 2 === 0) continue
    let parent = null
    for (const o of rings) {
      if (o.depth !== r.depth - 1) continue
      if (!ringContains(o.points, r.points[0], r.points[1])) continue
      if (!parent || o.area < parent.area) parent = o
    }
    const sh = parent ? shapes.get(parent) : undefined
    if (sh) sh.holes.push(new THREE.Path(toPath(r.points)))
  }
  return [...shapes.values()]
}


/* ── lente por normais: a extrusão tem faces paralelas, que cancelam o desvio da
   luz. Sem curvar a superfície, o núcleo sai nítido até a borda (M8 falha). Em vez
   de subdividir a malha, deriva-se um mapa de normais do campo de distância da
   própria silhueta: plano no meio, curvando forte perto do contorno. ────────── */
function buildDistanceField(source, traceSize) {
  const s = Math.min(1, traceSize / Math.max(source.width, source.height, 1))
  const c = s < 1 ? drawToCanvas(source, source.width * s, source.height * s) : source
  const ctx = c.getContext('2d', { willReadFrequently: true })
  const w = c.width, h = c.height
  const data = ctx.getImageData(0, 0, w, h).data
  const BIG = 1e9
  const dist = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) dist[i] = data[i * 4 + 3] >= ALPHA_CUTOFF ? BIG : 0

  // transformada de distância por chanfro, duas passadas
  const D1 = 1, D2 = 1.41421356
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; let d = dist[i]
    if (y > 0) { d = Math.min(d, dist[i - w] + D1); if (x > 0) d = Math.min(d, dist[i - w - 1] + D2); if (x < w - 1) d = Math.min(d, dist[i - w + 1] + D2) }
    if (x > 0) d = Math.min(d, dist[i - 1] + D1)
    dist[i] = d
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; let d = dist[i]
    if (y < h - 1) { d = Math.min(d, dist[i + w] + D1); if (x > 0) d = Math.min(d, dist[i + w - 1] + D2); if (x < w - 1) d = Math.min(d, dist[i + w + 1] + D2) }
    if (x < w - 1) d = Math.min(d, dist[i + 1] + D1)
    dist[i] = d
  }

  return { dist, w, h }
}

/* Abaula geometricamente a tampa frontal: subdivide os triângulos do cap e
   empurra z segundo o campo de distância. É isto que inclina de verdade o vetor
   de refração — mapa de normais só muda sombreamento, não desvia a luz. */
function domeFrontCap(geometry, field, aw, ah, domeHeight, radiusFrac, targetEdge) {
  const pos = geometry.getAttribute('position')
  const n = pos.count
  let maxZ = -Infinity
  for (let i = 0; i < n; i++) maxZ = Math.max(maxZ, pos.getZ(i))
  const EPS = 1e-4
  const R = Math.max(2, radiusFrac * Math.max(field.w, field.h))

  const sampleDist = (x, y) => {
    const u = Math.min(field.w - 1, Math.max(0, (x / aw) * field.w))
    const v = Math.min(field.h - 1, Math.max(0, (1 - y / ah) * field.h))
    return field.dist[Math.round(v) * field.w + Math.round(u)]
  }
  const lift = (x, y) => {
    const t = Math.min(sampleDist(x, y) / R, 1)
    return domeHeight * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)))
  }

  const out = []
  const push = (a, b, c) => { out.push(a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2]) }
  const mid = (a, b) => [(a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2]
  const edge = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1])
  const subdivide = (a, b, c, depth) => {
    if (depth <= 0 || Math.max(edge(a,b), edge(b,c), edge(c,a)) < targetEdge) {
      push(a, b, c); return
    }
    const ab = mid(a,b), bc = mid(b,c), ca = mid(c,a)
    subdivide(a, ab, ca, depth-1); subdivide(ab, b, bc, depth-1)
    subdivide(ca, bc, c, depth-1); subdivide(ab, bc, ca, depth-1)
  }

  for (let i = 0; i < n; i += 3) {
    const tri = [0,1,2].map((k) => [pos.getX(i+k), pos.getY(i+k), pos.getZ(i+k)])
    const isFront = tri.every((v) => Math.abs(v[2] - maxZ) < EPS)
    if (!isFront) { push(tri[0], tri[1], tri[2]); continue }
    // Longe do contorno a cúpula já é plana: subdividir ali é trabalho jogado
    // fora. Só o anel perto da borda precisa de resolução.
    const far = tri.every((v) => sampleDist(v[0], v[1]) > R * 1.15)
    if (far) { push(tri[0], tri[1], tri[2]); continue }
    subdivide(tri[0], tri[1], tri[2], 3)
  }
  // empurra só o que está na tampa
  for (let i = 0; i < out.length; i += 3) {
    if (Math.abs(out[i+2] - maxZ) < EPS) out[i+2] = maxZ + lift(out[i], out[i+1])
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(out), 3))
  g.computeVertexNormals()
  return g
}

function buildLensNormalMap(source, traceSize, radiusFrac, strength) {
  const field = buildDistanceField(source, traceSize)
  const { dist, w, h } = field
  const R = Math.max(2, radiusFrac * Math.max(w, h))
  const height = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const t = Math.min(dist[i] / R, 1)
    height[i] = Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)))
  }

  const out = makeCanvas(w, h)
  const octx = out.getContext('2d')
  const img = octx.createImageData(w, h)
  const at = (x, y) => height[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength
    const dy = (at(x, y + 1) - at(x, y - 1)) * strength
    let nx = -dx, ny = dy, nz = 1
    const len = Math.hypot(nx, ny, nz) || 1
    nx /= len; ny /= len; nz /= len
    const i = (y * w + x) * 4
    img.data[i] = (nx * 0.5 + 0.5) * 255
    img.data[i + 1] = (ny * 0.5 + 0.5) * 255
    img.data[i + 2] = (nz * 0.5 + 0.5) * 255
    img.data[i + 3] = 255
  }
  octx.putImageData(img, 0, 0)
  return out
}


/* ── suavização de contornos: bordas mais líquidas e orgânicas ──────────── */
function roundLoopCorners(points, radius) {
  const n = points.length
  if (n < 3) return points
  const out = []
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n]
    const curr = points[i]
    const next = points[(i + 1) % n]
    const inDir = curr.clone().sub(prev)
    const outDir = next.clone().sub(curr)
    const lenIn = inDir.length()
    const lenOut = outDir.length()
    if (lenIn < 1e-9 || lenOut < 1e-9) continue
    inDir.divideScalar(lenIn)
    outDir.divideScalar(lenOut)
    const angle = Math.acos(Math.min(Math.max(inDir.dot(outDir), -1), 1))
    if (angle < 0.1) { out.push(curr.clone()); continue }
    const trim = Math.min(radius, lenIn * 0.5, lenOut * 0.5)
    const p0 = curr.clone().addScaledVector(inDir, -trim)
    const p1 = curr.clone().addScaledVector(outDir, trim)
    const steps = Math.max(2, Math.ceil(angle / 0.3))
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const a = (1 - t) * (1 - t)
      const b = 2 * (1 - t) * t
      const c = t * t
      out.push(new THREE.Vector2(a * p0.x + b * curr.x + c * p1.x, a * p0.y + b * curr.y + c * p1.y))
    }
  }
  return out.length >= 3 ? out : points
}

function dedupeClosingPoint(points) {
  if (points.length > 1 && points[0].distanceToSquared(points[points.length - 1]) < 1e-12) {
    return points.slice(0, -1)
  }
  return points
}

function roundShapeCorners(shapes, radius) {
  if (radius < 1e-6) return shapes
  return shapes.map((shape) => {
    const extracted = shape.extractPoints(24)
    const rounded = new THREE.Shape(roundLoopCorners(dedupeClosingPoint(extracted.shape), radius))
    for (const hole of extracted.holes) {
      rounded.holes.push(new THREE.Path(roundLoopCorners(dedupeClosingPoint(hole), radius)))
    }
    return rounded
  })
}

/* ── flattenCapNormals: achata normais das faces de cap (não-dome) ──────── */
function flattenCapNormals(geometry) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  if (!position || !normal) return
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const cb = new THREE.Vector3()
  const ab = new THREE.Vector3()
  for (const group of geometry.groups) {
    if (group.materialIndex !== 0) continue
    for (let i = group.start; i < group.start + group.count; i += 3) {
      a.fromBufferAttribute(position, i)
      b.fromBufferAttribute(position, i + 1)
      c.fromBufferAttribute(position, i + 2)
      cb.subVectors(c, b)
      ab.subVectors(a, b)
      cb.cross(ab).normalize()
      for (let j = 0; j < 3; j++) normal.setXYZ(i + j, cb.x, cb.y, cb.z)
    }
  }
  normal.needsUpdate = true
}

function disposeObject(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose()
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    for (const material of materials) {
      if (!material) continue
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

/* ── backdrop: o campo Prism + o véu, dentro da cena, para o vidro refratar ── */
const PRISM_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;
uniform float uGlow, uNoise, uSaturation, uHueShift, uColorFreq, uBloom;
uniform float uCenterShift, uInvBaseHalf, uInvHeight, uMinAxis, uPxScale, uTimeScale;
uniform vec3 uVeilColor;
uniform vec3 uPageColor;
uniform float uVeilNear, uVeilMid, uVeilFar;
uniform float uLiftRadius, uLiftFeather, uLiftAmount;
uniform vec2 uLiftCenter;
uniform float uAspect;
uniform float uMainPass;
uniform vec2 uScreenScale, uScreenOffset;

vec4 tanh4(vec4 x){ vec4 e = exp(2.0*x); return (e - 1.0)/(e + 1.0); }
float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453123); }
float sdOcta(vec3 p){
  vec3 q = vec3(abs(p.x)*uInvBaseHalf, abs(p.y)*uInvHeight, abs(p.z)*uInvBaseHalf);
  return (q.x+q.y+q.z-1.0) * uMinAxis * 0.5773502691896258;
}
float sdPyr(vec3 p){ return max(sdOcta(p), -p.y); }

void main(){
  // No passe principal o backdrop não existe: o canvas fica transparente e o
  // Prism do DOM continua sendo o fundo da página. Ele só é desenhado dentro do
  // render target de transmissão, para o vidro ter o que refratar.
  if (uMainPass > 0.5) discard;

  // vUv do plano remapeado para o espaço de tela da página inteira, para o campo
  // refratado ficar coerente com o Prism que está atrás no DOM.
  vec2 sUv = vUv * uScreenScale + uScreenOffset;
  vec2 frag = sUv * iResolution;
  vec2 f = (frag - 0.5*iResolution) * uPxScale;
  float z = 5.0, d = 0.0;
  vec3 p; vec4 o = vec4(0.0);
  float t = iTime * uTimeScale;
  mat2 wob = mat2(cos(t), cos(t+33.0), cos(t+11.0), cos(t));
  for (int i = 0; i < 100; i++) {
    p = vec3(f, z);
    p.xz = p.xz * wob;
    vec3 q = p; q.y += uCenterShift;
    d = 0.1 + 0.2*abs(sdPyr(q));
    z -= d;
    o += (sin((p.y + z)*uColorFreq + vec4(0.0,1.0,2.0,3.0)) + 1.0)/d;
  }
  o = tanh4(o*o*(uGlow*uBloom)/1e5);
  vec3 col = o.rgb;
  col += (rand(frag + vec2(iTime)) - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);
  float L = dot(col, vec3(0.2126,0.7152,0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

  // O canvas do Prism escreve alpha por pixel com blend desligado, então o fundo
  // #F1F1EF da página atravessa onde o campo é fraco. Sem reproduzir isso, o
  // fundo fica escuro demais e o vidro refrata a página errada.
  col = mix(uPageColor, col, clamp(o.a, 0.0, 1.0));

  // véu radial: mesma elipse 120% x 80% do App.jsx
  vec2 c = (sUv - 0.5) / vec2(0.60, 0.40);
  float r = clamp(length(c), 0.0, 1.0);
  float veil = r < 0.4 ? mix(uVeilNear, uVeilMid, r/0.4)
                       : mix(uVeilMid, uVeilFar, (r-0.4)/0.6);

  // disco de levante: abre o véu só onde a marca vive
  vec2 lc = (sUv - uLiftCenter) * vec2(uAspect, 1.0);
  float lift = 1.0 - smoothstep(uLiftRadius, uLiftRadius + uLiftFeather, length(lc));
  veil *= 1.0 - lift * uLiftAmount;

  gl_FragColor = vec4(mix(col, uVeilColor, veil), 1.0);
}
`

const PRISM_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`

export function createLogo3D({ canvas }, options = {}) {
  const cfg = {
    src: '',
    highlight: '#2F66E0',
    environmentIntensity: 0.95,
    scale: 3,
    xOffset: 0,
    yOffset: 0,
    floatIntensity: 2,
    rotationIntensity: 1,
    rotationSpeed: 0.8,
    baseRotationZ: 0,
    floatSpeed: 2,
    orbit: false,
    zoom: false,
    autoRotate: false,
    fov: 65,
    cameraDistance: 4.2,
    onLoad: null,
    onError: null,

    // ── casca de vidro ──────────────────────────────────────────────────────
    // `glass: false` volta ao objeto texturizado antigo, sem custo de
    // transmissão. É o que o loader de 28px usa: vidro naquele tamanho é uma
    // mancha, e a barra de 2,5s precisa de algo identificável.
    glass: true,
    ior: 1.75,
    thickness: 2.2,
    roughness: 0.20,
    dispersion: 1.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.06,
    // Tingir não é enfeite: sobre uma página #F1F1EF o vidro claro fica
    // invisível. O tingimento é o que dá contraste à marca contra o fundo.
    tint: '#2f66e0',
    tintDensity: 0.4,
    extrudeDepth: 0.11,
    bevel: 0.25,
    traceSize: 2048,
    simplifyTolerance: 0.1,
    // Cúpula na tampa frontal. Sem ela a extrusão tem faces paralelas e não
    // refrata de frente. Valores altos empurram a face para perto da câmera e
    // ampliam o objeto por perspectiva — 0.5 é o teto útil.
    dome: 0.0,
    domeRadius: 0.18,
    domeEdge: 0.02,
    lens: 0,
    lensRadius: 0.09,
    lensSteepness: 42,

    // ── núcleo colorido ─────────────────────────────────────────────────────
    core: true,
    coreInset: 0.955,
    coreDepth: 0.26,
    coreRoughness: 0.5,
    coreMetalness: 0.1,
    // Piso de emissão: de costas a luz atravessa núcleo E casca tingida, e sem
    // isso a metade de trás da volta esmaga em quase preto.
    coreEmissive: 0.40,

    // ── backdrop refratável ─────────────────────────────────────────────────
    backdrop: true,
    veilNear: 0.85,
    veilMid: 0.65,
    veilFar: 0.4,
    // Levante do véu atrás da marca: sem contraste atrás, não há o que refratar.
    liftRadius: 0.18,
    liftFeather: 0.18,
    liftAmount: 0.9,
    pageBackground: '#F1F1EF',
    ...options,
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(cfg.fov, 1, 0.1, 200)
  camera.position.copy(CAMERA_DIR).multiplyScalar(cfg.cameraDistance)
  scene.add(camera)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableRotate = cfg.orbit
  controls.enableZoom = cfg.zoom

  const floatGroup = new THREE.Group()
  floatGroup.position.y = MODEL_LIFT
  const fitGroup = new THREE.Group()
  floatGroup.add(fitGroup)
  scene.add(floatGroup)

  /* backdrop preso à câmera, como no GlassObject */
  const veilColor = new THREE.Color(cfg.pageBackground)
  const backdropMat = new THREE.ShaderMaterial({
    vertexShader: PRISM_VERT,
    fragmentShader: PRISM_FRAG,
    depthWrite: false,
    uniforms: {
      iResolution: { value: new THREE.Vector2(1, 1) },
      iTime: { value: 0 },
      uGlow: { value: 0.45 }, uNoise: { value: 0.14 }, uSaturation: { value: 1.5 },
      uHueShift: { value: 0 }, uColorFreq: { value: 0.9 }, uBloom: { value: 0.7 },
      uCenterShift: { value: 3.5 * 0.25 },
      uInvBaseHalf: { value: 1 / (5.5 * 0.5) }, uInvHeight: { value: 1 / 3.5 },
      uMinAxis: { value: Math.min(5.5 * 0.5, 3.5) },
      uPxScale: { value: 1 / (900 * 0.1 * 3.2) },
      uTimeScale: { value: 0.32 },
      uVeilColor: { value: new THREE.Vector3(veilColor.r, veilColor.g, veilColor.b) },
      uPageColor: { value: new THREE.Vector3(veilColor.r, veilColor.g, veilColor.b) },
      uVeilNear: { value: cfg.veilNear }, uVeilMid: { value: cfg.veilMid }, uVeilFar: { value: cfg.veilFar },
      uLiftRadius: { value: cfg.liftRadius }, uLiftFeather: { value: cfg.liftFeather },
      uLiftAmount: { value: cfg.liftAmount }, uLiftCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
      uMainPass: { value: 1 },
      uScreenScale: { value: new THREE.Vector2(1, 1) },
      uScreenOffset: { value: new THREE.Vector2(0, 0) },
    },
  })
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backdropMat)
  backdrop.position.set(0, 0, -BACKDROP_DISTANCE)
  backdrop.visible = cfg.backdrop
  backdrop.renderOrder = -1
  // Só existe dentro do passe de transmissão. getRenderTarget() é null no passe
  // principal e aponta para o alvo de transmissão dentro dele.
  backdrop.onBeforeRender = (r) => {
    backdropMat.uniforms.uMainPass.value = r.getRenderTarget() === null ? 1 : 0
  }
  camera.add(backdrop)

  function layoutBackdrop() {
    const h = 2 * BACKDROP_DISTANCE * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    backdrop.scale.set(h * camera.aspect, h, 1)
  }

  /* ambiente */
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  let roomScene = null, ringMaterial = null, envTarget = null, envDirty = true

  function buildRoom() {
    roomScene = new THREE.Scene()
    const room = new THREE.Group()
    room.position.set(0, -0.5, 0)
    roomScene.add(room)
    for (const [x, z] of [[-15, 15], [15, 15], [15, -15], [-15, -15]]) {
      const s = new THREE.SpotLight(0xffffff, 2, 0, 0.2, 1, 0)
      s.position.set(x, 20, z)
      room.add(s, s.target)
    }
    const c = new THREE.PointLight(0xffffff, 100, 28, 2)
    c.position.set(0.5, 14, 0.5)
    room.add(c)
    const box = new THREE.BoxGeometry()
    const shell = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: 'gray', side: THREE.BackSide }))
    shell.position.set(0, 13.2, 0); shell.scale.set(31.5, 28.5, 31.5)
    room.add(shell)
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff })
    for (const d of ROOM_BLOCKS) {
      const m = new THREE.Mesh(box, white)
      m.position.set(...d.position); m.rotation.set(...d.rotation); m.scale.set(...d.scale)
      room.add(m)
    }
    for (const d of ROOM_FORMERS) {
      const g = d.kind === 'ring' ? new THREE.RingGeometry(0.5, 1, 64) : new THREE.BoxGeometry()
      const mt = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false })
      mt.color.set(d.kind === 'ring' ? cfg.highlight : '#ffffff').multiplyScalar(d.intensity)
      if (d.kind === 'ring') ringMaterial = mt
      const m = new THREE.Mesh(g, mt)
      m.position.set(...d.position); m.scale.set(...d.scale)
      if (d.lookAtCenter) m.lookAt(0, 0, 0)
      room.add(m)
      if (d.withLight) {
        const l = new THREE.PointLight(0xffffff, 100, 28, 2)
        l.position.set(...d.position)
        room.add(l)
      }
    }
  }
  function refreshEnv() {
    // Quando o backdrop do Prism está ativo, gera env map a partir do frame
    // atual do backdrop (blurrado), como o GlassObject faz com backgroundImage.
    // Isso dá reflexos coerentes com o que está atrás do vidro.
    if (cfg.backdrop && backdropMat.uniforms.iTime.value > 0) {
      try {
        const soft = document.createElement('canvas')
        soft.width = 64
        soft.height = 32
        const sctx = soft.getContext('2d')
        if (sctx) {
          // Renderiza um frame do backdrop em resolução baixa para o env map
          const tmpCanvas = document.createElement('canvas')
          tmpCanvas.width = 256
          tmpCanvas.height = 128
          const tmpRenderer = new THREE.WebGLRenderer({ canvas: tmpCanvas, alpha: false })
          const tmpScene = new THREE.Scene()
          const tmpCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2)
          tmpCamera.position.z = 1
          const tmpMat = backdropMat.clone()
          tmpMat.uniforms = { ...backdropMat.uniforms }
          tmpMat.uniforms.uMainPass = { value: 0 }
          tmpMat.uniforms.uScreenScale = { value: new THREE.Vector2(1, 1) }
          tmpMat.uniforms.uScreenOffset = { value: new THREE.Vector2(0, 0) }
          const tmpMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), tmpMat)
          tmpScene.add(tmpMesh)
          tmpRenderer.render(tmpScene, tmpCamera)
          sctx.filter = 'blur(4px)'
          sctx.drawImage(tmpCanvas, -4, -4, soft.width + 8, soft.height + 8)
          tmpMesh.geometry.dispose()
          tmpMat.dispose()
          tmpRenderer.dispose()
        }
        const equirect = new THREE.CanvasTexture(soft)
        equirect.colorSpace = THREE.SRGBColorSpace
        equirect.mapping = THREE.EquirectangularReflectionMapping
        envTarget?.dispose()
        envTarget = pmrem.fromEquirectangular(equirect)
        equirect.dispose()
        scene.environment = envTarget.texture
        return
      } catch { /* fallback para room scene */ }
    }

    if (!roomScene) buildRoom()
    if (ringMaterial) ringMaterial.color.set(cfg.highlight).multiplyScalar(15)
    envTarget?.dispose()
    envTarget = pmrem.fromScene(roomScene, 0, 0.1, 1000)
    scene.environment = envTarget.texture
  }

  /* materiais */
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: cfg.roughness,
    transmission: 1, ior: cfg.ior, thickness: cfg.thickness,
    dispersion: cfg.dispersion, clearcoat: cfg.clearcoat, clearcoatRoughness: 0.06,
    specularIntensity: 1,
  })
  if (cfg.tint) {
    shellMat.attenuationColor.set(cfg.tint)
    shellMat.attenuationDistance = 1.5 / Math.max(cfg.tintDensity, 0.01)
  }
  let coreMat = null

  let model = null
  let modelMaxDim = 1

  function applyFit() {
    if (!model) return
    fitGroup.scale.setScalar(cfg.scale / modelMaxDim)
    shellMat.thickness = Math.max(cfg.thickness, 0) / fitGroup.scale.x
  }

  function build(canvasSrc) {
    const longest = Math.max(canvasSrc.width, canvasSrc.height, 1)
    const aw = canvasSrc.width / longest, ah = canvasSrc.height / longest
    const shapes = buildShapes(canvasSrc, aw, ah, cfg.traceSize, cfg.simplifyTolerance)
    const group = new THREE.Group()

    const depthUnits = cfg.extrudeDepth
    const bevelAmount = cfg.bevel * depthUnits * 0.5

    if (cfg.glass) {
      let g = new THREE.ExtrudeGeometry(shapes, {
        depth: Math.max(depthUnits - bevelAmount * 2, depthUnits * 0.15),
        bevelEnabled: bevelAmount > 1e-4,
        bevelThickness: bevelAmount, bevelSize: 0.001,
        bevelOffset: 0, bevelSegments: 12, curveSegments: 24, steps: 1,
      })
      // flattenCapNormals nas faces de cap antes da cúpula — a cúpula só
      // modifica a tampa frontal, as demais precisam de normais achatadas.
      flattenCapNormals(g)
      let g2 = g
      if (cfg.dome > 0) {
        g2 = domeFrontCap(g, buildDistanceField(canvasSrc, cfg.traceSize), aw, ah,
                          cfg.dome * depthUnits, cfg.domeRadius, cfg.domeEdge * Math.max(aw, ah))
      }
      g = g2
      // toCreasedNormals elimina faceting visível na casca — ângulo de crease
      // de PI/7 mantém arestas vivas onde necessário.
      g = toCreasedNormals(g, Math.PI / 7)
      const sp = g.getAttribute('position')
      const suv = new Float32Array(sp.count * 2)
      for (let i = 0; i < sp.count; i++) {
        suv[i * 2] = sp.getX(i) / aw
        suv[i * 2 + 1] = sp.getY(i) / ah
      }
      g.setAttribute('uv', new THREE.BufferAttribute(suv, 2))
      if (cfg.lens > 0) {
        const nm = new THREE.CanvasTexture(buildLensNormalMap(canvasSrc, cfg.traceSize, cfg.lensRadius, cfg.lensSteepness))
        nm.colorSpace = THREE.NoColorSpace
        nm.anisotropy = renderer.capabilities.getMaxAnisotropy()
        shellMat.normalMap = nm
        shellMat.normalScale = new THREE.Vector2(cfg.lens, cfg.lens)
        shellMat.needsUpdate = true
      }
      group.add(new THREE.Mesh(g, shellMat))
    }

    if (cfg.core) {
      const cd = depthUnits * cfg.coreDepth
      const gc = new THREE.ExtrudeGeometry(shapes, {
        depth: cd, bevelEnabled: false, curveSegments: 24, steps: 1,
      })
      const pos = gc.getAttribute('position')
      const uv = new Float32Array(pos.count * 2)
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = pos.getX(i) / aw
        uv[i * 2 + 1] = pos.getY(i) / ah
      }
      gc.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
      gc.computeVertexNormals()

      const tex = new THREE.CanvasTexture(canvasSrc)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      coreMat = new THREE.MeshStandardMaterial({
        map: tex, color: 0xffffff,
        roughness: cfg.coreRoughness, metalness: cfg.coreMetalness,
        envMapIntensity: 1.2, transparent: false,
      })
      if (cfg.coreEmissive > 0) {
        coreMat.emissive = new THREE.Color(0xffffff)
        coreMat.emissiveMap = tex
        coreMat.emissiveIntensity = cfg.coreEmissive
      }
      const core = new THREE.Mesh(gc, coreMat)
      // recuo: o núcleo tem que ficar dentro do volume, com o trilho da casca por fora
      core.scale.set(cfg.coreInset, cfg.coreInset, 1)
      const cx = (aw / 2) * (1 - cfg.coreInset)
      const cy = (ah / 2) * (1 - cfg.coreInset)
      core.position.set(cx, cy, depthUnits * (1 - cfg.coreDepth) * 0.5 - bevelAmount)
      group.add(core)
    }

    const bounds = new THREE.Box3().setFromObject(group)
    const size = bounds.getSize(new THREE.Vector3())
    const off = bounds.getCenter(new THREE.Vector3())
    modelMaxDim = Math.max(size.x, size.y, size.z, 1e-4)
    group.position.sub(off)
    model = group
    applyFit()
    fitGroup.add(group)
  }

  let disposed = false
  let loadToken = 0
  let loadedSrc = null
  let rasterCache = null

  async function load() {
    const src = cfg.src
    if (src === loadedSrc && rasterCache) return
    loadedSrc = src
    const token = ++loadToken
    if (!src) { clearModel(); return }
    try {
      const res = await fetch(src)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      if (disposed || token !== loadToken) return
      const kind = sniffKind(new Uint8Array(buf))
      if (!kind) throw new Error('Formato de asset não reconhecido')
      const blob = new Blob([buf], { type: kind === 'svg' ? 'image/svg+xml' : '' })
      const raster = await decodeImage(blob)
      if (disposed || token !== loadToken) return
      rasterCache = raster
      build(raster)
      if (cfg.onLoad) cfg.onLoad()
    } catch (error) {
      if (disposed || token !== loadToken) return
      if (cfg.onError) cfg.onError(error)
    }
  }

  function clearModel() {
    if (!model) return
    fitGroup.remove(model)
    disposeObject(model)
    model = null
  }

  function resize() {
    const w = Math.max(canvas.clientWidth, 1), h = Math.max(canvas.clientHeight, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // O campo refratado tem que ser calculado no espaço da PÁGINA, não no do
    // canvas: é o mesmo Prism que está atrás, no DOM.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pw = window.innerWidth * dpr, ph = window.innerHeight * dpr
    backdropMat.uniforms.iResolution.value.set(pw, ph)
    backdropMat.uniforms.uPxScale.value = 1 / ((ph || 1) * 0.1 * 3.2)
    backdropMat.uniforms.uAspect.value = window.innerWidth / window.innerHeight

    const r = canvas.getBoundingClientRect()
    backdropMat.uniforms.uScreenScale.value.set(
      r.width / window.innerWidth,
      r.height / window.innerHeight,
    )
    backdropMat.uniforms.uScreenOffset.value.set(
      r.left / window.innerWidth,
      (window.innerHeight - r.bottom) / window.innerHeight,
    )
    layoutBackdrop()
  }
  new ResizeObserver(resize).observe(canvas)
  resize()
  load()

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = motionQuery.matches
  const onMotionChange = () => {
    reducedMotion = motionQuery.matches
    if (reducedMotion) floatGroup.rotation.set(0, 0, 0)
    applyOptions()
  }
  motionQuery.addEventListener('change', onMotionChange)

  function applyOptions() {
    scene.environmentIntensity = cfg.environmentIntensity
    controls.enableRotate = cfg.orbit
    controls.enableZoom = cfg.zoom
    controls.autoRotate = cfg.autoRotate && !reducedMotion
    camera.fov = cfg.fov
    camera.updateProjectionMatrix()
    floatGroup.position.x = cfg.xOffset
    floatGroup.position.y = MODEL_LIFT + cfg.yOffset
    shellMat.ior = Math.min(Math.max(cfg.ior, 1), 2.333)
    shellMat.roughness = Math.min(Math.max(cfg.roughness, 0), 1)
    shellMat.dispersion = Math.max(cfg.dispersion, 0)
    shellMat.clearcoat = Math.min(Math.max(cfg.clearcoat, 0), 1)
    if (cfg.tint) {
      shellMat.attenuationColor.set(cfg.tint)
      shellMat.attenuationDistance = 1.5 / Math.max(cfg.tintDensity, 0.01)
    } else {
      shellMat.attenuationColor.set(0xffffff)
      shellMat.attenuationDistance = Infinity
    }
    const uni = backdropMat.uniforms
    uni.uLiftRadius.value = cfg.liftRadius
    uni.uLiftFeather.value = cfg.liftFeather
    uni.uLiftAmount.value = cfg.liftAmount
    applyFit()
  }

  let inView = true
  let loopRunning = false
  let lastTime = 0
  let elapsed = Math.random() * 100
  const t0 = performance.now()

  function tick(time) {
    if (!inView) { lastTime = 0; stopLoop(); return }
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0
    lastTime = time
    if (envDirty) { envDirty = false; refreshEnv() }
    backdropMat.uniforms.iTime.value = (time - t0) / 1000
    controls.update()
    if (!reducedMotion) {
      elapsed += delta * cfg.floatSpeed
      floatGroup.rotation.y += delta * cfg.rotationSpeed
      floatGroup.position.y =
        MODEL_LIFT + cfg.yOffset + (Math.sin(elapsed / 1.5) / 10) * cfg.floatIntensity
    }
    fitGroup.rotation.z = cfg.baseRotationZ
    renderer.render(scene, camera)
  }

  function startLoop() {
    if (loopRunning || !inView || disposed) return
    loopRunning = true
    renderer.setAnimationLoop(tick)
  }
  function stopLoop() {
    if (!loopRunning) return
    loopRunning = false
    renderer.setAnimationLoop(null)
  }

  const viewObserver =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? true
          if (inView) startLoop()
          else stopLoop()
        })
      : null
  if (viewObserver) viewObserver.observe(canvas)

  applyOptions()
  startLoop()

  return {
    setOptions(next) {
      let changed = false
      for (const [key, value] of Object.entries(next)) {
        if (typeof value === 'function') continue
        if (cfg[key] !== value) { changed = true; break }
      }
      if (!changed) { Object.assign(cfg, next); return }

      const prevHighlight = cfg.highlight
      const prevDistance = cfg.cameraDistance
      // Trocar o material do objeto exige reconstruir a malha: a casca de vidro e
      // o núcleo são geometrias diferentes, não um parâmetro do mesmo mesh.
      const needsRebuild =
        (next.glass !== undefined && next.glass !== cfg.glass) ||
        (next.core !== undefined && next.core !== cfg.core) ||
        (next.extrudeDepth !== undefined && next.extrudeDepth !== cfg.extrudeDepth) ||
        (next.bevel !== undefined && next.bevel !== cfg.bevel) ||
        (next.dome !== undefined && next.dome !== cfg.dome)

      Object.assign(cfg, next)
      if (cfg.highlight !== prevHighlight) envDirty = true
      if (cfg.cameraDistance !== prevDistance) {
        camera.position.copy(CAMERA_DIR).multiplyScalar(cfg.cameraDistance)
      }
      applyOptions()
      resize()
      if (needsRebuild && rasterCache) { clearModel(); build(rasterCache) }
      if (next.src && next.src !== loadedSrc) load()
      startLoop()
    },
    resize,
    destroy() {
      disposed = true
      loadToken += 1
      stopLoop()
      if (viewObserver) viewObserver.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      controls.dispose()
      clearModel()
      if (roomScene) disposeObject(roomScene)
      backdrop.geometry.dispose()
      backdropMat.dispose()
      if (envTarget) envTarget.dispose()
      pmrem.dispose()
      shellMat.dispose()
      if (coreMat) coreMat.dispose()
      renderer.dispose()
    },
  }
}

export const HeroLogo3D = memo(function HeroLogo3D({ className, style, ...options }) {
  const canvasRef = useRef(null)
  const instanceRef = useRef(null)
  const [initialOptions] = useState(options)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    instanceRef.current = createLogo3D({ canvas }, initialOptions)
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
    }
  }, [initialOptions])

  useEffect(() => {
    if (instanceRef.current) instanceRef.current.setOptions(options)
  })

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
        }}
      />
    </div>
  )
})

export default HeroLogo3D
