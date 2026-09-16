import { PageHeader } from '@/components/shared/page-header'
import { Plus, Search } from 'lucide-react'
export function ModulePlaceholder({
  view,
}: {
  view: 'clientes' | 'productos' | 'inventario' | 'admin'
}) {
  const title =
    view === 'clientes'
      ? 'Clientes'
      : view === 'productos'
        ? 'Productos'
        : view === 'inventario'
          ? 'Inventario'
          : 'Administración'
  return (
    <div className="page">
      <PageHeader
        title={title}
        description={
          view === 'inventario'
            ? 'Consulta y actualiza las existencias de tu negocio.'
            : 'Gestiona la información de tu negocio con claridad.'
        }
        action={
          view !== 'admin' && (
            <button className="primary-button">
              <Plus />{' '}
              {view === 'clientes'
                ? 'Nuevo cliente'
                : view === 'productos'
                  ? 'Nuevo producto'
                  : 'Ajustar inventario'}
            </button>
          )
        }
      />
      <div className="panel empty-state">
        <div className="empty-icon">
          <Search />
        </div>
        <h2>Vista preparada para crecer</h2>
        <p>
          La estructura de {title.toLowerCase()} ya está lista para conectarse
          con tu API REST.
        </p>
      </div>
    </div>
  )
}
