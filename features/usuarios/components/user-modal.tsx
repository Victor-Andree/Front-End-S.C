'use client'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { type FormEvent, useState } from 'react'
import { createUser, updateUser } from '../api/users'
import type { ManagedUser, UserRole, UserStatus } from '../types'

export function UserModal({ user, onClose, onSaved }: { user: ManagedUser | null | undefined; onClose: () => void; onSaved: (user: ManagedUser) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  if (user === undefined) return null
  const editing = user !== null
  function close() { if (!saving) onClose() }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const data = new FormData(event.currentTarget)
    const base = { nombre: String(data.get('nombre') ?? '').trim(), apellidos: String(data.get('apellidos') ?? '').trim(), dni: String(data.get('dni') ?? '').trim(), correo: String(data.get('correo') ?? '').trim(), telefono: String(data.get('telefono') ?? '').trim(), username: String(data.get('username') ?? '').trim(), rol: String(data.get('rol')) as UserRole }
    const password = String(data.get('password') ?? '')
    setSaving(true); setError('')
    try {
      const saved = editing ? await updateUser(user!.usuarioId, { ...base, password: password || undefined, estado: String(data.get('estado')) as UserStatus }) : await createUser({ ...base, password })
      onSaved(saved); onClose()
    } catch (cause) { setError(getApiErrorMessage(cause, 'No se pudo guardar el usuario. Revisa los datos.')) }
    finally { setSaving(false) }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={close}>
    <section className="client-modal user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="user-modal-title">{editing ? 'Editar usuario' : 'Crear usuario'}</h2>
      <p className="muted">{editing ? 'Actualiza sus datos, acceso y permisos.' : 'Crea la cuenta de un trabajador.'}</p>
      <form onSubmit={submit}>
        <label>Nombre<input name="nombre" defaultValue={user?.nombre} required /></label><label>Apellidos<input name="apellidos" defaultValue={user?.apellidos} required /></label>
        <label>DNI<input name="dni" defaultValue={user?.dni} inputMode="numeric" pattern="[0-9]{8}" required /></label><label>Correo<input name="correo" defaultValue={user?.correo} type="email" required /></label>
        <label>Teléfono<input name="telefono" defaultValue={user?.telefono} inputMode="numeric" pattern="[0-9]{9}" required /></label><label>Usuario<input name="username" defaultValue={user?.username} minLength={3} maxLength={20} required autoComplete="off" /></label>
        <label>Contraseña<input name="password" type="password" minLength={6} required={!editing} autoComplete="new-password" placeholder={editing ? 'Dejar vacío para conservarla' : 'Mínimo 6 caracteres'} /></label>
        <label>Rol<select name="rol" defaultValue={user?.rol ?? 'ASISTENTE'}><option value="ASISTENTE">Asistente</option><option value="ADMIN">Administrador</option></select></label>
        {editing && <label>Estado<select name="estado" defaultValue={user.estado}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option><option value="BLOQUEADO">Bloqueado</option></select></label>}
        {error && <p className="form-error user-form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={close} disabled={saving}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear usuario'}</button></div>
      </form>
    </section>
  </div>
}
