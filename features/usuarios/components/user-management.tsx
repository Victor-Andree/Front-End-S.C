'use client'

import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { Pencil, Plus, RefreshCw, Search, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { changeUserStatus, getUsers } from '../api/users'
import type { ManagedUser } from '../types'
import { UserModal } from './user-modal'

export function UserManagement() {
  const { session } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([]), [loading, setLoading] = useState(true)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [query, setQuery] = useState('')
  const [modalUser, setModalUser] = useState<ManagedUser | null | undefined>(undefined)
  const [statusTarget, setStatusTarget] = useState<ManagedUser | null>(null)
  const [changingId, setChangingId] = useState<number | null>(null)
  const load = useCallback(async () => { setLoading(true); setError(''); try { setUsers(await getUsers()) } catch (cause) { setError(getApiErrorMessage(cause, 'No se pudieron cargar los usuarios.')) } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  const visible = useMemo(() => { const value = query.trim().toLowerCase(); return value ? users.filter((user) => `${user.nombre} ${user.apellidos} ${user.username} ${user.dni} ${user.rol} ${user.estado}`.toLowerCase().includes(value)) : users }, [users, query])
  function saved(user: ManagedUser) { setUsers((current) => current.some((item) => item.usuarioId === user.usuarioId) ? current.map((item) => item.usuarioId === user.usuarioId ? user : item) : [...current, user].sort((a, b) => a.nombre.localeCompare(b.nombre))); setNotice('Usuario guardado correctamente.') }
  async function toggle(user: ManagedUser) {
    const next = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    setChangingId(user.usuarioId); setError(''); setNotice('')
    try { saved(await changeUserStatus(user.usuarioId, next)); setStatusTarget(null) } catch (cause) { setError(getApiErrorMessage(cause, 'No se pudo cambiar el estado del usuario.')); setStatusTarget(null) } finally { setChangingId(null) }
  }
  return <div className="page users-page">
    <PageHeader eyebrow="Administración" title="Usuarios" description="Gestiona las cuentas, roles y accesos del equipo." action={<button className="primary-button" onClick={() => setModalUser(null)}><Plus /> Nuevo usuario</button>} />
    <div className="user-summary" aria-label="Resumen de usuarios"><div><ShieldCheck /><span><b>{users.filter((user) => user.rol === 'ADMIN').length}</b><small>Administradores</small></span></div><div><UserRoundCheck /><span><b>{users.filter((user) => user.estado === 'ACTIVO').length}</b><small>Cuentas activas</small></span></div><div><UserRoundX /><span><b>{users.filter((user) => user.estado !== 'ACTIVO').length}</b><small>Sin acceso</small></span></div></div>
    <div className="toolbar users-toolbar"><div className="search-box compact"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, usuario, DNI o rol…" aria-label="Buscar usuarios" /></div><button className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} /> Actualizar</button></div>
    {notice && <p className="success-message" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <section className="panel user-table"><div className="table-header"><span>Usuario</span><span>Rol</span><span>Estado</span><span>Contacto</span><span>Acciones</span></div>
      {loading && <div className="request-state">Cargando usuarios…</div>}
      {!loading && visible.map((user) => <article className="table-row" key={user.usuarioId}><span className="user-identity"><i>{user.nombre.charAt(0)}{user.apellidos.charAt(0)}</i><span><b>{user.nombre} {user.apellidos}</b><small>@{user.username} · DNI {user.dni}</small></span></span><span><span className={`badge ${user.rol === 'ADMIN' ? 'badge-admin' : 'badge-assistant'}`}>{user.rol === 'ADMIN' ? 'Administrador' : 'Asistente'}</span></span><span><span className={`badge ${user.estado === 'ACTIVO' ? 'badge-success' : 'badge-inactive'}`}><i className="badge-dot" />{user.estado.toLowerCase()}</span></span><span className="user-contact"><b>{user.correo}</b><small>{user.telefono}</small></span><span className="user-actions"><button className="small-button" onClick={() => setModalUser(user)}><Pencil /> Editar</button><button className={user.estado === 'ACTIVO' ? 'small-button user-disable' : 'small-button'} disabled={changingId === user.usuarioId || user.username === session?.username} onClick={() => setStatusTarget(user)}>{user.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button></span></article>)}
      {!loading && !visible.length && <div className="request-state">{query ? 'No encontramos usuarios con esa búsqueda.' : 'Aún no hay usuarios registrados.'}</div>}
    </section><UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSaved={saved} />
    {statusTarget && <div className="modal-backdrop" role="presentation" onMouseDown={() => changingId === null && setStatusTarget(null)}>
      <section className="client-modal status-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="status-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="status-confirm-title">{statusTarget.estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}</h2>
        <p>{statusTarget.estado === 'ACTIVO' ? 'Esta cuenta perderá el acceso inmediatamente, incluso si tiene una sesión abierta.' : 'Esta cuenta recuperará el acceso al sistema.'}</p>
        <div className="status-confirm-user"><b>{statusTarget.nombre} {statusTarget.apellidos}</b><small>@{statusTarget.username}</small></div>
        <div className="modal-actions"><button className="secondary-button" disabled={changingId !== null} onClick={() => setStatusTarget(null)}>Cancelar</button><button className={statusTarget.estado === 'ACTIVO' ? 'danger-confirm-button' : 'primary-button'} disabled={changingId !== null} onClick={() => void toggle(statusTarget)}>{changingId !== null ? 'Guardando…' : statusTarget.estado === 'ACTIVO' ? 'Sí, desactivar' : 'Sí, activar'}</button></div>
      </section>
    </div>}
  </div>
}
