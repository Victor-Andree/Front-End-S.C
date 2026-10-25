'use client'

import { createClient } from '../api/clients'
import type { Client } from '../types'
import { type FormEvent, useState } from 'react'

export function ClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (client: Client) => void
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const client = await createClient({
        nombre: String(data.get('nombre') ?? '').trim(),
        apellidos: String(data.get('apellidos') ?? '').trim(),
        dni: String(data.get('dni') ?? '').trim() || undefined,
        correo: String(data.get('correo') ?? '').trim() || undefined,
        telefono: String(data.get('telefono') ?? '').trim() || undefined,
      })
      onCreated(client)
      onClose()
    } catch {
      setError('No se pudo registrar el cliente. Revisa los datos.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="client-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="client-modal-title">Registrar cliente</h2>
        <p className="muted">Nombre y apellidos son obligatorios.</p>
        <form onSubmit={handleSubmit}>
          <label>Nombre<input name="nombre" required /></label>
          <label>Apellidos<input name="apellidos" required /></label>
          <label>DNI<input name="dni" inputMode="numeric" pattern="[0-9]{8}" /></label>
          <label>Correo<input name="correo" type="email" /></label>
          <label>Teléfono<input name="telefono" inputMode="numeric" pattern="[0-9]{9}" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cliente'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
