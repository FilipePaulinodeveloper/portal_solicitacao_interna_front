<script setup lang="ts">
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { Categorias } from '@/enums/categoria'
import { Status } from '@/enums/status'
import KanbanColumn from './KanbanColumn.vue'
import KanbanFilters from './KanbanFilters.vue'
import { emptyFilters, type ColumnId, type KanbanColumnDef, type KanbanTask, type SolicitacaoFilters } from './kanban'
import { atualizarStatusSolicitacao, listarSolicitacoes } from '@/services/solicitacoes'

const props = withDefaults(
  defineProps<{
    columns?: KanbanColumnDef[]
  }>(),
  {
    columns: () => [
      { id: Status.ABERTO, title: Status.ABERTO },
      { id: Status.EM_ANDAMENTO, title: Status.EM_ANDAMENTO },
      { id: Status.CONCLUIDO, title: Status.CONCLUIDO },
    ],
  },
)

const tasks = ref<KanbanTask[]>([])
const filters = ref<SolicitacaoFilters>(emptyFilters())
const refreshKey = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const draggingId = ref<string | null>(null)
const categories = Object.values(Categorias)
const statuses = Object.values(Status)

const tasksByColumn = computed(() =>
  Object.fromEntries(
    props.columns.map((column) => [
      column.id,
      tasks.value.filter((task) => task.status === column.id),
    ]),
  ) as Record<ColumnId, KanbanTask[]>,
)

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data
    if (typeof responseData === 'object' && responseData !== null) {
      const data = responseData as Record<string, unknown>
      if (typeof data.mensagem === 'string') return data.mensagem
      if (typeof data.message === 'string') return data.message
    }
    return error.message || 'Não foi possível carregar as solicitações.'
  }

  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar as solicitações.'
}

watch(
  [filters, refreshKey],
  ([currentFilters], _previousValues, onCleanup) => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const result = await listarSolicitacoes(currentFilters, controller.signal)
        if (!controller.signal.aborted) tasks.value = result
      } catch (error) {
        if (!controller.signal.aborted && !axios.isCancel(error)) {
          errorMessage.value = getErrorMessage(error)
        }
      } finally {
        if (!controller.signal.aborted) loading.value = false
      }
    }, 300)

    onCleanup(() => {
      window.clearTimeout(timeoutId)
      controller.abort()
    })
  },
  { deep: true, immediate: true },
)

function onSolicitacaoCreated(message: string) {
  successMessage.value = message
  refreshKey.value += 1
}

function onCardDragStart({ event, id }: { event: DragEvent; id: string }) {
  draggingId.value = id
  event.dataTransfer?.setData('text/plain', id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

async function moveTask(columnId: ColumnId, beforeId?: string) {
  const id = draggingId.value
  draggingId.value = null
  if (!id) return

  const task = tasks.value.find((item) => item.id === id)
  if (!task) return

  if (task.status !== columnId) {
    errorMessage.value = ''

    try {
      await atualizarStatusSolicitacao(task.id, columnId)
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      return
    }
  }

  const list = [...tasks.value]
  const from = list.findIndex((item) => item.id === id)
  if (from < 0) return

  const [movedTask] = list.splice(from, 1)
  const moved = { ...movedTask, status: columnId }
  const to = beforeId && beforeId !== id ? list.findIndex((item) => item.id === beforeId) : -1

  if (to >= 0) list.splice(to, 0, moved)
  else list.push(moved)
  tasks.value = list
}
</script>

<template>
  <div class="kanban-theme flex min-w-0 w-full flex-col gap-4 rounded-2xl bg-[var(--kb-bg)] p-3 sm:p-5 lg:p-6">
    <KanbanFilters
      v-model:filters="filters"
      :categories="categories"
      :statuses="statuses"
      @created="onSolicitacaoCreated"
    />

    <p v-if="successMessage" role="status" class="break-words rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" role="alert" class="break-words rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
      {{ errorMessage }}
    </p>
    <p v-else-if="loading && !tasks.length" role="status" class="py-8 text-center text-sm text-[var(--kb-muted)]">
      Carregando solicitações…
    </p>
    <p v-else-if="!loading && !tasks.length" class="py-8 text-center text-sm text-[var(--kb-muted)]">
      Nenhuma solicitação encontrada.
    </p>
    <p v-if="loading && tasks.length" role="status" class="text-right text-xs text-[var(--kb-muted)]">
      Atualizando solicitações…
    </p>

    <div class="grid min-w-0 grid-flow-col auto-cols-[minmax(16rem,85vw)] snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:auto-cols-[minmax(17rem,70vw)] md:grid-flow-row md:grid-cols-2 md:auto-cols-auto md:snap-none lg:grid-cols-3">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :tasks="tasksByColumn[column.id]"
        :dragging-id="draggingId"
        @card-dragstart="onCardDragStart"
        @card-dragend="draggingId = null"
        @drop-task="moveTask($event.columnId, $event.beforeId)"
      />
    </div>
  </div>
</template>
