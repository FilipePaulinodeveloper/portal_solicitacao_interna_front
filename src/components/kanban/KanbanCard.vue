<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { KanbanTask } from './kanban'

const props = defineProps<{ task: KanbanTask; dragging?: boolean }>()

const initials = computed(() =>
  (props.task.usuario?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase(),
)

const emit = defineEmits<{
  (e: 'dragstart', event: DragEvent): void
  (e: 'dragend', event: DragEvent): void
}>()
</script>

<template>
  <article
    draggable="true"
    class="group cursor-grab select-none rounded-lg border border-[var(--kb-border)] bg-[var(--kb-surface)] p-3 shadow-sm transition-colors hover:border-[var(--kb-accent)] active:cursor-grabbing"
    :class="{ 'opacity-40': dragging }"
    @dragstart="emit('dragstart', $event)"
    @dragend="emit('dragend', $event)"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="min-w-0 break-words text-sm font-medium leading-snug text-[var(--kb-ink)]">{{ task.title }}</h3>
    </div>

    <p v-if="task.description" class="mt-1.5 line-clamp-2 break-words text-xs text-[var(--kb-muted)]">
      {{ task.description }}
    </p>

    <div class="mt-3 flex min-w-0 items-center justify-between gap-2">
      <Badge
        variant="secondary"
        class="rounded-md bg-[var(--kb-brand)]/10 px-1.5 py-0 text-[11px] font-normal text-[var(--kb-brand)] hover:bg-[var(--kb-brand)]/10"
      >
        {{ task.categoria }}
      </Badge>

      <div
        v-if="task.usuario"
        class="flex min-w-0 items-center gap-2"
        :title="`${task.usuario.name} (${task.usuario.email})`"
      >
        <span class="min-w-0 truncate text-right text-xs text-[var(--kb-muted)]">
          {{ task.usuario.name }}
        </span>
        <Avatar class="size-6 shrink-0 ring-2 ring-white" :title="task.usuario.name">
          <AvatarImage
            v-if="task.usuario.avatar"
            :src="task.usuario.avatar"
            :alt="task.usuario.name"
          />
          <AvatarFallback class="bg-[var(--brand-primary)] text-[10px] font-medium text-white">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  </article>
</template>
