'use client'

import { Banknote, Clock3, RefreshCw, ShieldCheck } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { getCashRegisters, getCurrentCashSession, openCashSession } from '../api/cash-register'
import type { CashRegister, CashSession } from '../types'

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
const MAX_OPENING_AMOUNT = 9_999_999_999_999.99
const OPENING_AMOUNT_PATTERN = /^\d{1,13}(?:\.\d{1,2})?$/

type RegisterState = CashRegister & { session: CashSession | null }

export function CashManagement() {
  const { session: auth } = useAuth()
  const canOpen = auth?.role === 'ADMIN'
  const [registers, setRegisters] = useState<RegisterState[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [amount, setAmount] = useState('0.00')
  const [confirmation, setConfirmation] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const list = await getCashRegisters()
      const complete = await Promise.all(list.map(async (register) => ({
        ...register,
        session: register.sesionAbierta ? await getCurrentCashSession(register.cajaId) : null,
      })))
      setRegisters(complete)
      setSelectedId((current) => current && complete.some((item) => item.cajaId === current)
        ? current : complete.find((item) => item.activa)?.cajaId ?? null)
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'No se pudo consultar el estado de caja.'))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  function prepareOpening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('')
    const normalized = amount.trim()
    const value = Number(normalized)
    if (!OPENING_AMOUNT_PATTERN.test(normalized) || !Number.isFinite(value) || value > MAX_OPENING_AMOUNT) {
      setError('Ingresa un monto entre S/ 0.00 y S/ 9,999,999,999,999.99, con máximo dos decimales.'); return
    }
    setConfirmation(value)
  }

  async function confirmOpening() {
    if (selectedId === null || confirmation === null) return
    setSaving(true); setError('')
    try {
      await openCashSession(selectedId, confirmation)
      setConfirmation(null)
      setSuccess('Caja abierta correctamente.')
      await load()
    } catch (cause) {
      setConfirmation(null)
      setError(getApiErrorMessage(cause, 'No se pudo abrir la caja.'))
    } finally { setSaving(false) }
  }

  const selected = registers.find((item) => item.cajaId === selectedId) ?? null

  return (
    <div className="page cash-page">
      <PageHeader eyebrow="OPERACIÓN COMERCIAL" title="Gestión de caja"
        description="Consulta el estado actual y registra la apertura de la jornada." />

      {success && <p className="success-message" role="status">{success}</p>}
      {loading ? <div className="panel request-state">Consultando cajas…</div> : error && !registers.length ? (
        <div className="panel request-state request-error" role="alert"><p>{error}</p><button className="secondary-button" onClick={() => void load()}>Reintentar</button></div>
      ) : !registers.length ? <div className="panel request-state">No hay cajas configuradas.</div> : <>
        {error && <p className="form-error cash-error" role="alert">{error}</p>}
        <div className="cash-layout">
          <section className="panel cash-registers">
            <div className="panel-heading"><div><h2>Cajas disponibles</h2><p className="muted">Selecciona una caja para consultar su sesión.</p></div><button className="secondary-button" disabled={loading} onClick={() => void load()}><RefreshCw /> Actualizar</button></div>
            <div className="cash-register-list">{registers.map((register) => <button key={register.cajaId}
              className={register.cajaId === selectedId ? 'cash-register-card selected' : 'cash-register-card'}
              onClick={() => { setSelectedId(register.cajaId); setError(''); setSuccess('') }}>
              <span className="cash-icon"><Banknote /></span><span><b>{register.nombre}</b><small>{register.activa ? 'Caja activa' : 'Caja inactiva'}</small></span>
              <StatusBadge tone={register.session ? 'warning' : 'success'}>{register.session ? 'ABIERTA' : 'CERRADA'}</StatusBadge>
            </button>)}</div>
          </section>

          <section className="panel cash-status">
            {selected?.session ? <><div className="cash-status-heading"><span className="cash-icon open"><Clock3 /></span><div><p className="eyebrow">SESIÓN ACTUAL</p><h2>Caja abierta</h2></div></div>
              <dl className="cash-details"><div><dt>Monto inicial</dt><dd>{money.format(selected.session.montoInicial)}</dd></div><div><dt>Fecha de apertura</dt><dd>{dateTime.format(new Date(selected.session.fechaApertura))}</dd></div><div><dt>Responsable</dt><dd>{selected.session.usuarioApertura}</dd></div></dl>
              <p className="cash-note">El cierre, arqueo y los movimientos de caja se implementarán en historias posteriores.</p></> : <><div className="cash-status-heading"><span className="cash-icon"><ShieldCheck /></span><div><p className="eyebrow">SESIÓN ACTUAL</p><h2>Caja cerrada</h2></div></div>
              <p className="muted">No existe una sesión abierta para {selected?.nombre.toLowerCase()}.</p>
              {canOpen && selected?.activa ? <form className="cash-opening-form" onSubmit={prepareOpening}>
                <label>Monto inicial (S/)<input type="number" min="0" max="9999999999999.99" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} disabled={saving} /></label>
                <button className="primary-button" disabled={saving}>Registrar apertura</button>
              </form> : <p className="cash-note">Tu perfil puede consultar el estado. La apertura está reservada para ADMIN.</p>}</>}
          </section>
        </div>
      </>}

      {confirmation !== null && <div className="modal-backdrop" role="presentation">
        <section className="cancel-modal cash-confirm" role="dialog" aria-modal="true" aria-labelledby="cash-confirm-title">
          <h2 id="cash-confirm-title">Confirmar apertura</h2>
          <p>Se abrirá <b>{selected?.nombre}</b> con un monto inicial de <strong>{money.format(confirmation)}</strong>.</p>
          <p className="muted">Esta operación quedará asociada a tu usuario.</p>
          <div className="modal-actions"><button className="secondary-button" disabled={saving} onClick={() => setConfirmation(null)}>Volver</button><button className="primary-button" disabled={saving} onClick={() => void confirmOpening()}>{saving ? 'Abriendo…' : 'Confirmar apertura'}</button></div>
        </section>
      </div>}
    </div>
  )
}
