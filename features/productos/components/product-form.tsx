'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api/errors'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { getProductCategories, saveProduct } from '../api/products'
import type { Product, ProductCategory, ProductRequest } from '../types'

export function ProductForm({ product, onClose, onSaved }: {
  product?: Product
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})

  useEffect(() => { dialog.current?.showModal() }, [])
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getProductCategories().then((result) => {
      if (active) setCategories(result)
    }).catch((cause) => {
      if (active) setError(getApiErrorMessage(cause, 'No se pudieron cargar las categorías.'))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || loading || !categories.length) return
    const data = new FormData(event.currentTarget)
    const payload: ProductRequest = {
      nombre: String(data.get('nombre') ?? '').trim(),
      descripcion: String(data.get('descripcion') ?? '').trim(),
      precioVenta: Number(data.get('precioVenta')),
      stockMinimo: Number(data.get('stockMinimo')),
      tipoProductoId: Number(data.get('tipoProductoId')),
      estado: data.get('estado') === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
      ...(!product ? { cantidadInicial: Number(data.get('cantidadInicial')) } : {}),
    }
    const invalid: Record<string, string> = {}
    if (!payload.nombre) invalid.nombre = 'Ingresa el nombre.'
    if (!payload.descripcion) invalid.descripcion = 'Ingresa la descripción.'
    if (!Number.isFinite(payload.precioVenta) || payload.precioVenta <= 0) invalid.precioVenta = 'El precio debe ser mayor que cero.'
    for (const name of ['stockMinimo', 'cantidadInicial'] as const) {
      const value = payload[name]
      if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 2147483647)) invalid[name] = 'Ingresa un entero entre 0 y 2147483647.'
    }
    if (!categories.some((category) => category.tipoProductoId === payload.tipoProductoId)) invalid.tipoProductoId = 'Selecciona una categoría.'
    setFields(invalid)
    setError('')
    if (Object.keys(invalid).length) return
    setSaving(true)
    try {
      await saveProduct(payload, product?.id)
      onSaved()
    } catch (cause) {
      if (cause instanceof ApiError && cause.body && typeof cause.body === 'object' && 'errors' in cause.body) {
        const errors = cause.body.errors
        if (errors && typeof errors === 'object') {
          setFields(Object.fromEntries(Object.entries(errors).filter((entry): entry is [string, string] => typeof entry[1] === 'string')))
        }
      }
      setError(getApiErrorMessage(cause, 'No se pudo guardar el producto. Revisa los datos e intenta de nuevo.'))
    } finally { setSaving(false) }
  }

  function fieldError(name: string) {
    return fields[name] ? <span className="field-error" id={`product-${name}-error`}>{fields[name]}</span> : null
  }
  function validation(name: string) {
    return { 'aria-invalid': !!fields[name], 'aria-describedby': fields[name] ? `product-${name}-error` : undefined }
  }

  return (
    <dialog ref={dialog} className="client-modal product-modal" aria-labelledby="product-form-title"
      onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }}>
      <h2 id="product-form-title">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
      <p className="muted">{product ? 'Actualiza los datos del catálogo. Las existencias se gestionan en inventario.' : 'Registra el producto y sus existencias iniciales.'}</p>
      {loading && <p role="status">Cargando categorías…</p>}
      {!loading && !categories.length && <p>No hay categorías disponibles. Un administrador debe registrar una categoría para continuar.</p>}
      <form onSubmit={submit}>
        <fieldset disabled={saving}>
          <label>Nombre<input name="nombre" required defaultValue={product?.name} autoFocus {...validation('nombre')} />{fieldError('nombre')}</label>
          <label>Categoría<select key={loading ? 'loading' : 'ready'} name="tipoProductoId" required defaultValue={product?.categoryId ?? ''} disabled={loading || !categories.length} {...validation('tipoProductoId')}>
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((category) => <option key={category.tipoProductoId} value={category.tipoProductoId}>{category.nombre}</option>)}
          </select>{fieldError('tipoProductoId')}</label>
          <label className="full-width">Descripción<textarea name="descripcion" required defaultValue={product?.description} rows={3} {...validation('descripcion')} />{fieldError('descripcion')}</label>
          <label>Precio de venta (S/)<input name="precioVenta" type="number" required min="0.01" step="0.01" defaultValue={product?.price} {...validation('precioVenta')} />{fieldError('precioVenta')}</label>
          <label>Stock mínimo<input name="stockMinimo" type="number" required min="0" max="2147483647" step="1" defaultValue={product?.min ?? 0} {...validation('stockMinimo')} />{fieldError('stockMinimo')}</label>
          {!product && <label>Stock inicial<input name="cantidadInicial" type="number" required min="0" max="2147483647" step="1" defaultValue={0} {...validation('cantidadInicial')} />{fieldError('cantidadInicial')}</label>}
          <label>Estado<select name="estado" defaultValue={product?.status ?? 'ACTIVO'}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select>{fieldError('estado')}</label>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          {!loading && !categories.length && <button type="button" className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>Recargar categorías</button>}
          <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="primary-button" disabled={saving || loading || !categories.length}>{saving ? 'Guardando…' : 'Guardar producto'}</button>
        </div>
      </form>
    </dialog>
  )
}
