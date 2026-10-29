'use client'

import { PageHeader } from '@/components/shared/page-header'
import { TablePagination } from '@/components/shared/table-pagination'
import { Plus, RefreshCw, Search, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useClients } from '../hooks/use-clients'
import { ClientModal } from './client-modal'

const date = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

export function Clients() {
  const { clients, isLoading, error, reload, addClient } = useClients()
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return clients
    return clients.filter((client) =>
      `${client.nombre} ${client.apellidos} ${client.dni} ${client.correo} ${client.telefono}`
        .toLowerCase().includes(normalized),
    )
  }, [clients, query])
  useEffect(() => { setPage(1) }, [query, pageSize])
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedClients = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="page clients-page">
      <PageHeader title="Clientes" description="Consulta y registra los clientes de tu negocio."
        action={<button className="primary-button" onClick={() => setShowModal(true)}><Plus /> Nuevo cliente</button>} />
      <div className="toolbar clients-toolbar">
        <div className="search-box compact"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, DNI o contacto..." aria-label="Buscar clientes" /></div>
        <button className="secondary-button" onClick={() => void reload()} disabled={isLoading}><RefreshCw className={isLoading ? 'spin' : ''} /> Actualizar</button>
      </div>
      {error && <div className="request-state request-error"><p>{error}</p><button className="secondary-button" onClick={() => void reload()}>Reintentar</button></div>}
      {!error && <section className="panel client-table">
        <div className="table-header"><span>Cliente</span><span>DNI</span><span>Correo</span><span>Teléfono</span><span>Registro</span></div>
        {isLoading && <div className="request-state">Cargando clientes…</div>}
        {!isLoading && pagedClients.map((client) => <div className="table-row" key={client.clienteId}>
          <span className="client-name"><i><UserRound /></i><b>{client.nombre} {client.apellidos}</b></span>
          <span>{client.dni || '—'}</span><span>{client.correo || '—'}</span><span>{client.telefono || '—'}</span>
          <span>{client.fechaRegistro ? date.format(new Date(client.fechaRegistro)) : '—'}</span>
        </div>)}
        {!isLoading && !visible.length && <div className="request-state">{query ? 'No encontramos clientes con esa búsqueda.' : 'Aún no hay clientes registrados.'}</div>}
        {!isLoading && <TablePagination total={visible.length} page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />}
      </section>}
      <ClientModal open={showModal} onClose={() => setShowModal(false)} onCreated={addClient} />
    </div>
  )
}
