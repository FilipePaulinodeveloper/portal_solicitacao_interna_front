<script setup lang="ts">
import { computed } from 'vue'
import { Search, SlidersHorizontal, X } from 'lucide-vue-next'
import CriarSolicitacaoDialog from './CriarSolicitacaoDialog.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { emptyFilters, type SolicitacaoFilters } from './kanban'
import type { Categorias } from '@/enums/categoria'
import type { Status } from '@/enums/status'

defineProps<{
  categories: Categorias[]
  statuses: Status[]
}>()

const filters = defineModel<SolicitacaoFilters>('filters', { default: emptyFilters })
const emit = defineEmits<{
  created: [message: string]
}>()

const activeCount = computed(
  () => Object.values(filters.value).filter((value) => value !== '').length,
)

const clear = () => {
  filters.value = emptyFilters()
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <div class="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--kb-muted)]" />
        <Input
          v-model="filters.titulo"
          type="search"
          placeholder="Buscar por título…"
          aria-label="Filtrar por título"
          class="h-10 rounded-lg border-[var(--kb-border)] bg-[var(--kb-surface)] pl-9 text-[var(--kb-ink)] placeholder:text-[var(--kb-muted)] focus-visible:border-[var(--kb-accent)] focus-visible:ring-[var(--kb-accent)]/30"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="h-10 gap-2 rounded-lg border-[var(--kb-border)] bg-[var(--kb-surface)] text-[var(--kb-ink)] hover:border-[var(--kb-accent)] hover:bg-[var(--kb-accent)]/10 hover:text-[var(--kb-brand)] data-[state=open]:border-[var(--kb-accent)] data-[state=open]:bg-[var(--kb-accent)]/10"
          >
            <SlidersHorizontal class="size-4" />
            Filtros
            <span
              v-if="activeCount"
              class="grid size-5 place-items-center rounded-full bg-[var(--kb-brand)] text-[11px] font-medium text-white"
            >
              {{ activeCount }}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" class="w-72 border-[var(--kb-border)] p-3">
          <!-- <div class="space-y-2">
            <DropdownMenuLabel class="p-0 text-[var(--kb-muted)]">Descrição</DropdownMenuLabel>
            <Input
              v-model="filters.descricao"
              type="search"
              placeholder="Filtrar por descrição"
              aria-label="Filtrar por descrição"
              class="h-9 border-[var(--kb-border)] bg-[var(--kb-surface)]"
            />
          </div> -->

          <DropdownMenuSeparator class="my-3" />
          <div class="space-y-2">
            <DropdownMenuLabel class="p-0 text-[var(--kb-muted)]">Período de criação</DropdownMenuLabel>
            <Input
              v-model="filters.data_inicio"
              type="date"
              aria-label="Data inicial do período de criação"
              class="h-9 border-[var(--kb-border)] bg-[var(--kb-surface)]"
            />
            <Input
              v-model="filters.data_fim"
              type="date"
              aria-label="Data final do período de criação"
              class="h-9 border-[var(--kb-border)] bg-[var(--kb-surface)]"
            />
          </div>

          <DropdownMenuSeparator class="my-3" />
          <div class="space-y-2">
            <DropdownMenuLabel class="p-0 text-[var(--kb-muted)]">Categoria</DropdownMenuLabel>
            <select
              v-model="filters.categoria"
              aria-label="Filtrar por categoria"
              class="h-9 w-full rounded-md border border-[var(--kb-border)] bg-[var(--kb-surface)] px-3 text-sm text-[var(--kb-ink)]"
            >
              <option value="">Todas as categorias</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <DropdownMenuSeparator class="my-3" />
          <div class="space-y-2">
            <DropdownMenuLabel class="p-0 text-[var(--kb-muted)]">Status</DropdownMenuLabel>
            <select
              v-model="filters.status"
              aria-label="Filtrar por status"
              class="h-9 w-full rounded-md border border-[var(--kb-border)] bg-[var(--kb-surface)] px-3 text-sm text-[var(--kb-ink)]"
            >
              <option value="">Todos os status</option>
              <option v-for="status in statuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        v-if="activeCount"
        variant="ghost"
        class="h-10 gap-1 text-[var(--kb-muted)] hover:text-[var(--kb-brand)]"
        @click="clear"
      >
        <X class="size-4" />
        Limpar
      </Button>
    </div>

    <CriarSolicitacaoDialog @created="emit('created', $event)" />
  </div>
</template>
