import { Categorias } from '@/enums/categoria'
import { Status } from '@/enums/status'
import type { KanbanTask, SolicitacaoFilters } from '@/components/kanban/kanban'
import api from './api'

interface ApiSolicitacao {
  id: string | number
  titulo: string
  descricao: string | null
  categoria: Categorias
  status: Status
  created_at?: string | null
  updated_at?: string | null
  usuario?: {
    id: string | number
    name: string
    email: string
    avatar?: string
  } | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiSolicitacao(value: unknown): value is ApiSolicitacao {
  return isRecord(value)
    && (typeof value.id === 'string' || typeof value.id === 'number')
    && typeof value.titulo === 'string'
    && (typeof value.descricao === 'string' || value.descricao === null)
    && Object.values(Categorias).some((categoria) => categoria === value.categoria)
    && Object.values(Status).some((status) => status === value.status)
    && (value.created_at === undefined || value.created_at === null || typeof value.created_at === 'string')
    && (value.updated_at === undefined || value.updated_at === null || typeof value.updated_at === 'string')
    && (value.usuario === undefined
      || value.usuario === null
      || (
        isRecord(value.usuario)
        && (typeof value.usuario.id === 'string' || typeof value.usuario.id === 'number')
        && typeof value.usuario.name === 'string'
        && typeof value.usuario.email === 'string'
        && (value.usuario.avatar === undefined || typeof value.usuario.avatar === 'string')
      ))
}

function getSolicitacaoRows(data: unknown): ApiSolicitacao[] {
  if (!Array.isArray(data) || !data.every(isApiSolicitacao)) {
    throw new Error('A API retornou uma lista de solicitações em formato inválido.')
  }

  return data
}

interface ApiSolicitacoesPage {
  rows: ApiSolicitacao[]
  currentPage: number
  lastPage: number
  total: number
}

function getSolicitacoesPage(data: unknown): ApiSolicitacoesPage {
  const payload = isRecord(data) && 'dados' in data ? data.dados : data

  if (
    !isRecord(payload)
    || !Array.isArray(payload.data)
    || !Number.isInteger(payload.current_page)
    || !Number.isInteger(payload.last_page)
    || !Number.isInteger(payload.total)
  ) {
    throw new Error('A API retornou uma página de solicitações em formato inválido.')
  }

  return {
    rows: getSolicitacaoRows(payload.data),
    currentPage: payload.current_page as number,
    lastPage: payload.last_page as number,
    total: payload.total as number,
  }
}

export async function listarSolicitacoes(
  filters: SolicitacaoFilters,
  status: Status,
  page: number,
  signal?: AbortSignal,
): Promise<{ tasks: KanbanTask[]; currentPage: number; lastPage: number; total: number }> {
  const params = {
    ...(filters.titulo.trim() && { titulo: filters.titulo.trim() }),
    ...(filters.descricao.trim() && { descricao: filters.descricao.trim() }),
    ...(filters.categoria && { categoria: filters.categoria }),
    status,
    page,
    ...(filters.data_inicio && { data_inicio: filters.data_inicio }),
    ...(filters.data_fim && { data_fim: filters.data_fim }),
  }

  const response = await api.get<unknown>(
      'solicitacoes',
      {
        params,
        signal,
      },
    )

  const result = getSolicitacoesPage(response.data)
  return {
    ...result,
    tasks: result.rows.map((solicitacao) => ({
      id: String(solicitacao.id),
      title: solicitacao.titulo,
      description: solicitacao.descricao ?? undefined,
      categoria: solicitacao.categoria,
      status: solicitacao.status,
      createdAt: solicitacao.created_at ?? undefined,
      updatedAt: solicitacao.updated_at ?? undefined,
      usuario: solicitacao.usuario
        ? {
            id: String(solicitacao.usuario.id),
            name: solicitacao.usuario.name,
            email: solicitacao.usuario.email,
            avatar: solicitacao.usuario.avatar,
          }
        : undefined,
    })),
  }
}

export async function criarSolicitacao(solicitacao: {
  titulo: string
  descricao: string
  categoria: Categorias
}): Promise<string> {
  const response = await api.post<{ mensagem: string }>('solicitacoes', solicitacao)
  return response.data.mensagem
}

export async function atualizarSolicitacao(
  id: string,
  solicitacao: {
    titulo: string
    descricao: string
    categoria: Categorias
    status?: Status
  },
): Promise<string | undefined> {
  const response = await api.patch<{ mensagem?: string }>(
    `solicitacoes/${encodeURIComponent(id)}`,
    solicitacao,
  )

  return response.data.mensagem
}

export async function excluirSolicitacao(id: string): Promise<string | undefined> {
  const response = await api.delete<{ mensagem?: string }>(
    `solicitacoes/${encodeURIComponent(id)}`,
  )

  return response.data.mensagem
}

export async function atualizarStatusSolicitacao(
  id: string,
  status: Status,
): Promise<void> {
  await api.patch(`solicitacoes/${encodeURIComponent(id)}/status`, {
    'status': status
  })
}
