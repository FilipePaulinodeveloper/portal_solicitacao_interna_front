<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import KanbanCard from './KanbanCard.vue'
import type { ColumnId, KanbanColumnDef, KanbanTask } from './kanban'

const props = defineProps<{
  column: KanbanColumnDef
  tasks: KanbanTask[]
  draggingId: string | null
  currentPage: number
  lastPage: number
  total: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'card-dragstart', payload: { event: DragEvent; id: string }): void
  (e: 'card-dragend'): void
  (e: 'open-task', task: KanbanTask): void
  (e: 'drop-task', payload: { columnId: ColumnId; beforeId?: string }): void
  (e: 'page-change', payload: { columnId: ColumnId; page: number }): void
}>()

const isOver = ref(false)
const overCardId = ref<string | null>(null)
const pageCount = computed(() => Math.max(1, props.lastPage))

function onDrop() {
  emit('drop-task', { columnId: props.column.id, beforeId: overCardId.value ?? undefined })
  isOver.value = false
  overCardId.value = null
}
</script>

<template>
  <section
    class="flex min-h-[20rem] w-full min-w-0 snap-start flex-col rounded-xl border bg-white/60 transition-colors md:min-h-[24rem]"
    :class="isOver ? 'border-[var(--kb-accent)] bg-[var(--kb-accent)]/5' : 'border-[var(--kb-border)]'"
    @dragover.prevent="isOver = true"
    @dragleave.self="isOver = false"
    @drop.prevent="onDrop"
  >
    <header class="flex items-center gap-2 px-3 py-3">
      <h2 class="text-sm font-semibold text-[var(--kb-ink)]">{{ column.title }}</h2>
      <Badge
        variant="outline"
        class="ml-auto rounded-full border-[var(--kb-border)] bg-[var(--kb-surface)] px-2 py-0 text-xs font-medium text-[var(--kb-brand)]"
      >
        {{ total }}
      </Badge>
    </header>

    <div class="flex flex-1 flex-col gap-2 p-2 pt-0">
      <div
        v-for="task in tasks"
        :key="task.id"
        @dragover.prevent.stop="(isOver = true), (overCardId = task.id)"
      >
        <KanbanCard
          :task="task"
          :dragging="draggingId === task.id"
          @dragstart="emit('card-dragstart', { event: $event, id: task.id })"
          @dragend="emit('card-dragend')"
          @open="emit('open-task', task)"
        />
      </div>

      <p
        v-if="!tasks.length && !loading"
        class="grid flex-1 place-items-center rounded-lg border border-dashed border-[var(--kb-border)] p-4 text-center text-xs text-[var(--kb-muted)]"
      >
        Arraste uma tarefa para cá
      </p>
      <p v-if="loading && !tasks.length" role="status" class="p-4 text-center text-xs text-[var(--kb-muted)]">
        Carregando solicitações…
      </p>
    </div>

    <footer
      v-if="pageCount > 1"
      class="flex items-center justify-between gap-2 border-t border-[var(--kb-border)] px-3 py-2"
    >
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs text-[var(--kb-brand)] hover:bg-[var(--kb-accent)]/10 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="currentPage === 1 || loading"
        :aria-label="`Ir para a página anterior de ${column.title}`"
        @click="emit('page-change', { columnId: column.id, page: currentPage - 1 })"
      >
        Anterior
      </button>
      <span class="text-xs text-[var(--kb-muted)]" aria-live="polite">
        Página {{ currentPage }} de {{ pageCount }}
      </span>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs text-[var(--kb-brand)] hover:bg-[var(--kb-accent)]/10 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="currentPage === pageCount || loading"
        :aria-label="`Ir para a próxima página de ${column.title}`"
        @click="emit('page-change', { columnId: column.id, page: currentPage + 1 })"
      >
        Próxima
      </button>
    </footer>
  </section>
</template>
