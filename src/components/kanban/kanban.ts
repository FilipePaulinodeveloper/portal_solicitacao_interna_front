import { Categorias } from '@/enums/categoria'
import { Status } from '@/enums/status'

export type ColumnId = Status

export interface KanbanTask {
  id: string
  title: string
  description?: string
  categoria: Categorias
  status: Status
  createdAt?: string
  updatedAt?: string
  usuario?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface KanbanColumnDef {
  id: ColumnId
  title: string
}

export interface SolicitacaoFilters {
  titulo: string
  descricao: string
  categoria: Categorias | ''
  status: Status | ''
  data_inicio: string
  data_fim: string
}

export const emptyFilters = (): SolicitacaoFilters => ({
  titulo: '',
  descricao: '',
  categoria: '',
  status: '',
  data_inicio: '',
  data_fim: '',
})
