'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TablePagination({ total, page, pageSize, onPageChange, onPageSizeChange }: {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  if (!total) return null
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pages)
  const start = (current - 1) * pageSize + 1
  const end = Math.min(current * pageSize, total)
  return <footer className="table-pagination">
    <span>Mostrando {start}–{end} de {total}</span>
    <label>Filas<select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}><option value={5}>5</option><option value={10}>10</option></select></label>
    <div><button aria-label="Página anterior" disabled={current === 1} onClick={() => onPageChange(current - 1)}><ChevronLeft /></button><span>{current} de {pages}</span><button aria-label="Página siguiente" disabled={current === pages} onClick={() => onPageChange(current + 1)}><ChevronRight /></button></div>
  </footer>
}
