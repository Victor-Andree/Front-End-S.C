const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Exercise the production API modules with an isolated HTTP boundary.
function loadModule(file, apiRequest) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require(name) {
    assert.equal(name, '@/lib/api/client')
    return { apiRequest }
  } })
  return exports
}

const products = [
  { productoId: 1, nombre: 'Activo', descripcion: 'Descripción', tipoProductoId: 8, tipoProductoNombre: 'Filtros', precioVenta: 10, stockMinimo: 3, estadoProducto: 'ACTIVO' },
  { productoId: 2, nombre: 'Inactivo', descripcion: 'Otro', tipoProductoId: 8, tipoProductoNombre: 'Filtros', precioVenta: 10, stockMinimo: 3, estadoProducto: 'INACTIVO' },
]

test('sales and notifications continue receiving only active products', async () => {
  const calls = []
  const api = loadModule('features/productos/api/get-products.ts', async (url, options) => {
    calls.push([url, options.authenticated])
    return url.endsWith('/productos') ? products : [{ productoId: 1, cantidadActual: 7 }]
  })
  const result = await api.getProducts()
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 1)
  assert.equal(result[0].stock, 7)
  assert.equal(calls.length, 2)
  assert.ok(calls.every(([, authenticated]) => authenticated))
})

test('administration includes inactive products and the fields needed for editing', async () => {
  const api = loadModule('features/productos/api/get-products.ts', async (url) => url.endsWith('/productos') ? products : [])
  const result = await api.getProducts({ includeInactive: true })
  assert.equal(result.length, 2)
  assert.equal(result[1].status, 'INACTIVO')
  assert.equal(result[1].categoryId, 8)
  assert.equal(result[1].description, 'Otro')
  assert.equal(result[1].stock, 0)
})

test('failed stock requests surface an error instead of showing false zero stock', async () => {
  const error = new Error('Sin permisos')
  const api = loadModule('features/productos/api/get-products.ts', async (url) => {
    if (url.endsWith('/stocks')) throw error
    return products
  })
  await assert.rejects(api.getProducts(), (cause) => cause === error)
})

test('creation sends initial stock in the product request; editing uses PUT without stock initialization', async () => {
  const calls = []
  const api = loadModule('features/productos/api/products.ts', async (url, options) => { calls.push({ url, ...options }); return {} })
  await api.saveProduct({ nombre: 'Nuevo', cantidadInicial: 12 })
  await api.saveProduct({ nombre: 'Editado' }, 42)
  assert.equal(calls[0].url, '/api/v1/productos')
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].body.cantidadInicial, 12)
  assert.equal(calls[1].url, '/api/v1/productos/42')
  assert.equal(calls[1].method, 'PUT')
  assert.equal(calls[1].body.cantidadInicial, undefined)
  assert.ok(calls.every((call) => call.authenticated))
})

test('category requests use the real backend contract and save failures propagate', async () => {
  const api = loadModule('features/productos/api/products.ts', async (url) => {
    if (url === '/api/v1/tiposproducto') return [{ tipoProductoId: 8, nombre: 'Filtros' }]
    throw new Error('Producto duplicado')
  })
  assert.equal((await api.getProductCategories())[0].tipoProductoId, 8)
  await assert.rejects(api.saveProduct({}), /Producto duplicado/)
})
