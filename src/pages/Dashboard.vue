<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Activity, CheckCircle2, ClipboardList, Clock3 } from 'lucide-vue-next'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { obterResumoDashboard, type ResumoDashboard } from '@/services/dashboard'

interface StatusChartItem {
  status: string
  quantidade: number
  color: string
}

const summary = ref<ResumoDashboard | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const chartConfig = {
  abertas: { label: 'Abertas', color: '#3B7DB5' },
  atendimento: { label: 'Em atendimento', color: '#64A3D1' },
  concluidas: { label: 'Concluídas', color: '#1E5A8A' },
} satisfies ChartConfig

let controller: AbortController | undefined

const chartData = computed<StatusChartItem[]>(() => {
  if (!summary.value) return []

  return [
    { status: 'Abertas', quantidade: summary.value.solicitacoes_abertas, color: chartConfig.abertas.color },
    { status: 'Em atendimento', quantidade: summary.value.solicitacoes_em_atendimento, color: chartConfig.atendimento.color },
    { status: 'Concluídas', quantidade: summary.value.solicitacoes_concluidas, color: chartConfig.concluidas.color },
  ]
})

const cards = computed(() => {
  if (!summary.value) return []

  return [
    {
      title: 'Total',
      value: summary.value.total_solicitacoes,
      description: 'Solicitações cadastradas',
      icon: ClipboardList,
      color: 'text-[var(--brand-primary)]',
      iconBackground: 'bg-[#EAF2F8]',
    },
    {
      title: 'Abertas',
      value: summary.value.solicitacoes_abertas,
      description: 'Aguardando atendimento',
      icon: Activity,
      color: 'text-[var(--brand-primary)]',
      iconBackground: 'bg-[#EAF2F8]',
    },
    {
      title: 'Em atendimento',
      value: summary.value.solicitacoes_em_atendimento,
      description: 'Em andamento',
      icon: Clock3,
      color: 'text-[var(--brand-primary-hover)]',
      iconBackground: 'bg-[#EAF2F8]',
    },
    {
      title: 'Concluídas',
      value: summary.value.solicitacoes_concluidas,
      description: 'Atendimentos concluídos',
      icon: CheckCircle2,
      color: 'text-[var(--brand-primary-hover)]',
      iconBackground: 'bg-[#EAF2F8]',
    },
  ]
})

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'object' && data !== null) {
      const responseData = data as Record<string, unknown>
      if (typeof responseData.mensagem === 'string') return responseData.mensagem
      if (typeof responseData.message === 'string') return responseData.message
    }
    return error.message || 'Não foi possível carregar o resumo do dashboard.'
  }

  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar o resumo do dashboard.'
}

onMounted(async () => {
  controller = new AbortController()
  loading.value = true
  errorMessage.value = ''

  try {
    summary.value = await obterResumoDashboard(controller.signal)
  } catch (error) {
    if (!controller.signal.aborted && !axios.isCancel(error)) {
      errorMessage.value = getErrorMessage(error)
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
})

onUnmounted(() => controller?.abort())
</script>

<template>
  <section class="flex w-full min-w-0 flex-col gap-6">
    <header>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">Resumo</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Visão geral das solicitações internas.
      </p>
    </header>

    <p v-if="loading" role="status" class="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
      Carregando resumo…
    </p>
    <p v-else-if="errorMessage" role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <template v-else-if="summary">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card v-for="card in cards" :key="card.title" class="gap-4 py-5">
          <CardHeader class="flex grid-cols-none grid-rows-none flex-row items-center justify-between gap-3">
            <div class="grid gap-1.5">
              <CardDescription>{{ card.title }}</CardDescription>
              <CardTitle class="text-3xl font-bold tabular-nums">
                {{ card.value.toLocaleString('pt-BR') }}
              </CardTitle>
            </div>
            <div class="grid size-11 shrink-0 place-items-center rounded-xl" :class="card.iconBackground">
              <component :is="card.icon" class="size-5" :class="card.color" />
            </div>
          </CardHeader>
          <CardContent class="pt-0 text-xs text-muted-foreground">
            {{ card.description }}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações por status</CardTitle>
          <CardDescription>Distribuição das solicitações cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="summary.total_solicitacoes > 0" class="grid items-center gap-6 md:grid-cols-2">
            <ChartContainer :config="chartConfig" class="mx-auto h-64 max-w-md">
              <VisSingleContainer :data="chartData" :height="256">
                <VisDonut
                  :value="(item: StatusChartItem) => item.quantidade"
                  :color="(item: StatusChartItem) => item.color"
                  :central-label="summary.total_solicitacoes.toLocaleString('pt-BR')"
                  central-sub-label="solicitações"
                  :arc-width="32"
                />
              </VisSingleContainer>
            </ChartContainer>

            <ul class="grid gap-4">
              <li v-for="item in chartData" :key="item.status" class="flex items-center justify-between gap-4">
                <span class="flex items-center gap-2 text-sm text-foreground">
                  <span class="size-3 rounded-sm" :style="{ backgroundColor: item.color }" aria-hidden="true" />
                  {{ item.status }}
                </span>
                <span class="font-semibold tabular-nums text-foreground">
                  {{ item.quantidade.toLocaleString('pt-BR') }}
                </span>
              </li>
            </ul>
          </div>
          <p v-else class="py-10 text-center text-sm text-muted-foreground">
            Ainda não há solicitações para exibir no gráfico.
          </p>
        </CardContent>
      </Card>
    </template>
  </section>
</template>
