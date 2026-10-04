<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import KanbanCard from './KanbanCard.vue'
import type { ColumnId, KanbanColumnDef, KanbanTask } from './kanban'

const props = defineProps<{
  column: KanbanColumnDef
  tasks: KanbanTask[]
  draggingId: string | null
}>()

const emit = defineEmits<{
  (e: 'card-dragstart', payload: { event: DragEvent; id: string }): void
  (e: 'card-dragend'): void
  (e: 'drop-task', payload: { columnId: ColumnId; beforeId?: string }): void
}>()

const isOver = ref(false)
const overCardId = ref<string | null>(null)

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
        {{ tasks.length }}
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
        />
      </div>

      <p
        v-if="!tasks.length"
        class="grid flex-1 place-items-center rounded-lg border border-dashed border-[var(--kb-border)] p-4 text-center text-xs text-[var(--kb-muted)]"
      >
        Arraste uma tarefa para cá
      </p>
    </div>
  </section>
</template>
