import api from './api'

export interface ResumoDashboard {
  total_solicitacoes: number
  solicitacoes_abertas: number
  solicitacoes_em_atendimento: number
  solicitacoes_concluidas: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isResumoDashboard(value: unknown): value is ResumoDashboard {
  return isRecord(value)
    && typeof value.total_solicitacoes === 'number'
    && typeof value.solicitacoes_abertas === 'number'
    && typeof value.solicitacoes_em_atendimento === 'number'
    && typeof value.solicitacoes_concluidas === 'number'
}

export async function obterResumoDashboard(signal?: AbortSignal): Promise<ResumoDashboard> {
  const response = await api.get<unknown>('dashboard', { signal })
  const data = isRecord(response.data) ? response.data.dados : null

  if (!isResumoDashboard(data)) {
    throw new Error('A API retornou um resumo de dashboard em formato inválido.')
  }

  return data
}
