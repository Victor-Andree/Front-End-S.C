'use client'

import { ArrowDownCircle, ArrowUpCircle, Banknote, Clock3, RefreshCw, ShieldCheck } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { createCashMovement, getCashMovements, getCashRegisters, getCashSummary, getCurrentCashSession, openCashSession } from '../api/cash-register'
import type { CashMovement, CashMovementType, CashRegister, CashSession, CashSummary } from '../types'

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
const MAX_OPENING_AMOUNT = 9_999_999_999_999.99
const OPENING_AMOUNT_PATTERN = /^\d{1,13}(?:\.\d{1,2})?$/
const MOVEMENT_AMOUNT_PATTERN = /^\d{1,13}(?:\.\d{1,2})?$/

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
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [summary, setSummary] = useState<CashSummary | null>(null)
  const [movementLoading, setMovementLoading] = useState(false)
  const [movementError, setMovementError] = useState('')
  const [movementType, setMovementType] = useState<CashMovementType>('INGRESO')
  const [movementAmount, setMovementAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [movementConfirmation, setMovementConfirmation] = useState<{ tipo: CashMovementType; monto: number; concepto: string; idempotencyKey: string; sessionId: number } | null>(null)
  const movementRequestSequence = useRef(0)

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

  const loadMovements = useCallback(async (sessionId: number) => {
    const requestSequence = ++movementRequestSequence.current
    setMovementLoading(true); setMovementError('')
    setMovements([]); setSummary(null)
    try {
      const [movementList, currentSummary] = await Promise.all([
        getCashMovements(sessionId), getCashSummary(sessionId),
      ])
      if (requestSequence !== movementRequestSequence.current) return
      setMovements(movementList); setSummary(currentSummary)
    } catch (cause) {
      if (requestSequence !== movementRequestSequence.current) return
      setMovementError(getApiErrorMessage(cause, 'No se pudieron consultar los movimientos de caja.'))
    } finally {
      if (requestSequence === movementRequestSequence.current) setMovementLoading(false)
    }
  }, [])

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

  useEffect(() => {
    if (selected?.session) void loadMovements(selected.session.sesionCajaId)
    else {
      movementRequestSequence.current += 1
      setMovements([]); setSummary(null); setMovementError(''); setMovementLoading(false)
    }
  }, [selected?.session?.sesionCajaId, loadMovements])

  function prepareMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMovementError(''); setSuccess('')
    const normalized = movementAmount.trim()
    const value = Number(normalized)
    const normalizedConcept = concept.trim()
    if (!MOVEMENT_AMOUNT_PATTERN.test(normalized) || !Number.isFinite(value) || value <= 0 || value > MAX_OPENING_AMOUNT) {
      setMovementError('Ingresa un monto mayor a S/ 0.00, con máximo 13 enteros y dos decimales.'); return
    }
    if (!normalizedConcept || normalizedConcept.length > 200) {
      setMovementError('El concepto es obligatorio y admite hasta 200 caracteres.'); return
    }
    if (!selected?.session) return
    setMovementConfirmation({
      tipo: movementType,
      monto: value,
      concepto: normalizedConcept,
      idempotencyKey: crypto.randomUUID(),
      sessionId: selected.session.sesionCajaId,
    })
  }

  async function confirmMovement() {
    if (!movementConfirmation) return
    setSaving(true); setMovementError('')
    try {
      await createCashMovement(movementConfirmation.sessionId, {
        tipo: movementConfirmation.tipo,
        monto: movementConfirmation.monto,
        concepto: movementConfirmation.concepto,
      }, movementConfirmation.idempotencyKey)
      setMovementConfirmation(null); setMovementAmount(''); setConcept('')
      setSuccess(`${movementConfirmation.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado correctamente.`)
      await loadMovements(movementConfirmation.sessionId)
    } catch (cause) {
      setMovementError(getApiErrorMessage(cause, 'No se pudo registrar el movimiento.'))
    } finally { setSaving(false) }
  }

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
              <dl className="cash-details"><div><dt>Saldo provisional</dt><dd>{summary ? money.format(summary.saldoProvisional) : '—'}</dd></div><div><dt>Monto inicial</dt><dd>{money.format(selected.session.montoInicial)}</dd></div><div><dt>Fecha de apertura</dt><dd>{dateTime.format(new Date(selected.session.fechaApertura))}</dd></div><div><dt>Responsable</dt><dd>{selected.session.usuarioApertura}</dd></div></dl>
              <p className="cash-note">El saldo considera el monto inicial y los movimientos manuales. Las ventas se integrarán en una historia posterior.</p></> : <><div className="cash-status-heading"><span className="cash-icon"><ShieldCheck /></span><div><p className="eyebrow">SESIÓN ACTUAL</p><h2>Caja cerrada</h2></div></div>
              <p className="muted">No existe una sesión abierta para {selected?.nombre.toLowerCase()}.</p>
              {canOpen && selected?.activa ? <form className="cash-opening-form" onSubmit={prepareOpening}>
                <label>Monto inicial (S/)<input type="number" min="0" max="9999999999999.99" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} disabled={saving} /></label>
                <button className="primary-button" disabled={saving}>Registrar apertura</button>
              </form> : <p className="cash-note">Tu perfil puede consultar el estado. La apertura está reservada para ADMIN.</p>}</>}
          </section>
        </div>
        {selected?.session && <section className="cash-movements">
          {canOpen && <form className="panel cash-movement-form" onSubmit={prepareMovement}>
            <div><p className="eyebrow">MOVIMIENTO MANUAL</p><h2>Registrar ingreso o egreso</h2></div>
            <div className="movement-type-selector" role="group" aria-label="Tipo de movimiento">
              {(['INGRESO', 'EGRESO'] as CashMovementType[]).map((type) => <button type="button" key={type}
                className={movementType === type ? 'selected' : ''} onClick={() => setMovementType(type)} disabled={saving}>
                {type === 'INGRESO' ? <ArrowUpCircle /> : <ArrowDownCircle />}{type === 'INGRESO' ? 'Ingreso' : 'Egreso'}
              </button>)}
            </div>
            <label>Monto (S/)<input type="number" min="0.01" max="9999999999999.99" step="0.01" inputMode="decimal" required value={movementAmount} onChange={(event) => setMovementAmount(event.target.value)} disabled={saving} /></label>
            <label>Concepto<textarea maxLength={200} required value={concept} onChange={(event) => setConcept(event.target.value)} disabled={saving} placeholder="Motivo del movimiento" /><small>{concept.length}/200</small></label>
            <button className="primary-button" disabled={saving}>Continuar</button>
          </form>}
          <div className="panel cash-movement-history">
            <div className="panel-heading"><div><p className="eyebrow">HISTORIAL</p><h2>Movimientos de la sesión</h2></div><button className="secondary-button" disabled={movementLoading} onClick={() => void loadMovements(selected.session!.sesionCajaId)}><RefreshCw /> Actualizar</button></div>
            {movementError && <p className="form-error" role="alert">{movementError}</p>}
            {movementLoading ? <p className="request-state">Consultando movimientos…</p> : !movements.length ? <p className="request-state">Aún no hay movimientos manuales.</p> : <div className="movement-list">{movements.map((movement) => <article key={movement.movimientoCajaId} className={`movement-item ${movement.tipo.toLowerCase()}`}>
              <span className="movement-icon">{movement.tipo === 'INGRESO' ? <ArrowUpCircle /> : <ArrowDownCircle />}</span>
              <div><b>{movement.concepto}</b><small>{movement.origen === 'VENTA' ? `Venta #${movement.ventaId} · ` : 'Manual · '}{dateTime.format(new Date(movement.fechaMovimiento))} · {movement.usuarioResponsable}</small></div>
              <strong>{movement.tipo === 'INGRESO' ? '+' : '−'} {money.format(movement.monto)}</strong>
            </article>)}</div>}
          </div>
        </section>}
      </>}

      {confirmation !== null && <div className="modal-backdrop" role="presentation">
        <section className="cancel-modal cash-confirm" role="dialog" aria-modal="true" aria-labelledby="cash-confirm-title">
          <h2 id="cash-confirm-title">Confirmar apertura</h2>
          <p>Se abrirá <b>{selected?.nombre}</b> con un monto inicial de <strong>{money.format(confirmation)}</strong>.</p>
          <p className="muted">Esta operación quedará asociada a tu usuario.</p>
          <div className="modal-actions"><button className="secondary-button" disabled={saving} onClick={() => setConfirmation(null)}>Volver</button><button className="primary-button" disabled={saving} onClick={() => void confirmOpening()}>{saving ? 'Abriendo…' : 'Confirmar apertura'}</button></div>
        </section>
      </div>}
      {movementConfirmation && <div className="modal-backdrop" role="presentation">
        <section className="cancel-modal cash-confirm" role="dialog" aria-modal="true" aria-labelledby="movement-confirm-title">
          <h2 id="movement-confirm-title">Confirmar {movementConfirmation.tipo.toLowerCase()}</h2>
          <p>Registrarás <strong>{money.format(movementConfirmation.monto)}</strong> por “{movementConfirmation.concepto}”.</p>
          <p className="muted">La operación quedará asociada a tu usuario y no podrá editarse ni eliminarse.</p>
          {movementError && <p className="form-error" role="alert">{movementError}</p>}
          <div className="modal-actions"><button className="secondary-button" disabled={saving} onClick={() => setMovementConfirmation(null)}>Volver</button><button className="primary-button" disabled={saving} onClick={() => void confirmMovement()}>{saving ? 'Guardando…' : 'Confirmar movimiento'}</button></div>
        </section>
      </div>}
    </div>
  )
}
