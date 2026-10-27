'use client'

import { FileSpreadsheet, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { downloadSalesReportExcel, getSalesReport } from '../api/reports'
import type { SalesReport } from '../types'

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const shortDate = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' })
const localIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initialRange() {
  const today = new Date()
  return { desde: localIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)), hasta: localIsoDate(today) }
}

export function SalesReportView() {
  const initial = useMemo(initialRange, [])
  const [desde, setDesde] = useState(initial.desde)
  const [hasta, setHasta] = useState(initial.hasta)
  const [report, setReport] = useState<SalesReport | null>(null)
  const [appliedRange, setAppliedRange] = useState<{ desde: string; hasta: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    if (!desde || !hasta || desde > hasta) { setError('Selecciona un rango de fechas válido.'); return }
    setLoading(true); setError('')
    try {
      setReport(await getSalesReport(desde, hasta))
      setAppliedRange({ desde, hasta })
    }
    catch (cause) { setError(getApiErrorMessage(cause, 'No se pudo cargar el reporte.')) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, []) // Initial report only; filters use the explicit button.

  const maxIncome = Math.max(1, ...(report?.evolucion.map((item) => item.ingresos) ?? []))
  const points = report?.evolucion.map((item, index, all) => {
    const x = all.length === 1 ? 50 : (index / (all.length - 1)) * 100
    const y = 92 - (item.ingresos / maxIncome) * 78
    return `${x},${y}`
  }).join(' ') ?? ''

  return (
    <div className="page report-page">
      <PageHeader eyebrow="ANALÍTICA COMERCIAL" title="Reportes comerciales"
        description="Resultados calculados desde las ventas completadas del negocio."
        action={<div className="report-export-actions">
          <button className="primary-button" disabled={!report || !appliedRange || loading}
            onClick={() => appliedRange && downloadSalesReportExcel(appliedRange.desde, appliedRange.hasta).catch(() => setError('No se pudo descargar el Excel.'))}>
            <FileSpreadsheet /> Excel
          </button>
        </div>} />

      <section className="report-filters panel">
        <label>Desde<input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} /></label>
        <label>Hasta<input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} /></label>
        <button className="primary-button" onClick={() => void load()} disabled={loading}>Aplicar filtros</button>
      </section>
      {error && <p className="form-error report-error">{error}</p>}
      {loading && <div className="request-state">Calculando reporte…</div>}
      {!loading && report && <>
        <section className="stats-grid report-stats">
          <article className="stat-card featured"><span className="stat-label">Ingresos completados <TrendingUp /></span><strong>{money.format(report.ingresosTotales)}</strong><span className="stat-meta">Sin pendientes ni anuladas</span></article>
          <article className="stat-card"><span className="stat-label">Ventas</span><strong>{report.cantidadVentas}</strong><span className="stat-meta">Operaciones completadas</span></article>
          <article className="stat-card"><span className="stat-label">Ticket promedio</span><strong>{money.format(report.ticketPromedio)}</strong><span className="stat-meta">Ingreso promedio por venta</span></article>
        </section>
        <section className="report-layout">
          <article className="panel report-chart">
            <div className="panel-heading"><div><h2>Evolución de ingresos</h2><p className="muted">Ventas completadas por día.</p></div></div>
            {report.cantidadVentas === 0 ? <div className="request-state">No hay ventas completadas en este período.</div> :
              <div className="chart-wrap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Evolución de ingresos"><line x1="0" y1="92" x2="100" y2="92" /><polyline points={points} />{report.evolucion.map((item, index, all) => { const x = all.length === 1 ? 50 : index / (all.length - 1) * 100; const y = 92 - item.ingresos / maxIncome * 78; return <circle key={item.fecha} cx={x} cy={y} r="1.4"><title>{`${item.fecha}: ${money.format(item.ingresos)}`}</title></circle> })}</svg><div className="chart-labels">{report.evolucion.filter((_, index, all) => index === 0 || index === all.length - 1 || index % Math.max(1, Math.ceil(all.length / 4)) === 0).map((item) => <span key={item.fecha}>{shortDate.format(new Date(`${item.fecha}T12:00:00`))}</span>)}</div></div>}
          </article>
          <article className="panel report-ranking"><div className="panel-heading"><div><h2>Productos más vendidos</h2><p className="muted">Ranking por unidades vendidas.</p></div></div>
            <div className="ranking-list">{report.productosMasVendidos.slice(0, 10).map((product, index) => <div className="ranking-row" key={product.productoId}><b>{index + 1}</b><span><strong>{product.nombre}</strong><small>{product.unidades} unidades</small></span><strong>{money.format(product.ingresos)}</strong></div>)}{!report.productosMasVendidos.length && <div className="request-state">Sin productos vendidos.</div>}</div>
          </article>
        </section>
      </>}
    </div>
  )
}
