<script setup lang="ts">
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Categorias } from '@/enums/categoria'
import { Status } from '@/enums/status'
import { atualizarSolicitacao, excluirSolicitacao } from '@/services/solicitacoes'
import type { KanbanTask } from './kanban'

const props = defineProps<{
  task: KanbanTask | null
}>()

const emit = defineEmits<{
  close: []
  updated: [message: string]
  deleted: [message: string]
}>()

const title = ref('')
const description = ref('')
const category = ref<Categorias | ''>('')
const status = ref<Status | ''>('')
const isSaving = ref(false)
const isDeleting = ref(false)
const confirmDelete = ref(false)
const errorMessage = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const categories = Object.values(Categorias)
const statuses = Object.values(Status)
const dialogOpen = computed({
  get: () => props.task !== null,
  set: (open: boolean) => {
    if (!open) emit('close')
  },
})
const canEdit = computed(() => props.task?.status === Status.ABERTO)
const initials = computed(() =>
  (props.task?.usuario?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

watch(
  () => props.task,
  (task) => {
    title.value = task?.title ?? ''
    description.value = task?.description ?? ''
    category.value = task?.categoria ?? ''
    status.value = task?.status ?? ''
    errorMessage.value = ''
    validationErrors.value = {}
    confirmDelete.value = false
  },
)

function formatDate(value?: string): string {
  if (!value) return 'Não informada'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getValidationErrors(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([field, messages]) => {
      if (typeof messages === 'string') return [[field, [messages]]]
      if (Array.isArray(messages)) {
        const textMessages = messages.filter((message): message is string => typeof message === 'string')
        return textMessages.length ? [[field, textMessages]] : []
      }
      return []
    }),
  )
}

function handleSaveError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (isRecord(data)) {
      validationErrors.value = getValidationErrors(data.erros ?? data.errors)
      if (typeof data.mensagem === 'string') {
        errorMessage.value = data.mensagem
        return
      }
      if (typeof data.message === 'string') {
        errorMessage.value = data.message
        return
      }
      if (Object.keys(validationErrors.value).length) {
        errorMessage.value = 'A API recusou a alteração. Confira os detalhes abaixo.'
        return
      }
    }
    errorMessage.value = error.message || 'Não foi possível atualizar a solicitação.'
    return
  }

  errorMessage.value = error instanceof Error
    ? error.message
    : 'Não foi possível atualizar a solicitação.'
}

async function save() {
  const task = props.task
  if (!task || !category.value || !status.value) return

  isSaving.value = true
  errorMessage.value = ''
  validationErrors.value = {}

  try {
    const message = await atualizarSolicitacao(task.id, {
      titulo: title.value.trim(),
      descricao: description.value.trim(),
      categoria: category.value,
      ...(status.value !== task.status ? { status: status.value } : {}),
    })
    emit('updated', message || 'Solicitação atualizada com sucesso.')
  } catch (error) {
    handleSaveError(error)
  } finally {
    isSaving.value = false
  }
}

async function remove() {
  const task = props.task
  if (!task || !canEdit.value || !confirmDelete.value) return

  isDeleting.value = true
  errorMessage.value = ''
  validationErrors.value = {}

  try {
    const message = await excluirSolicitacao(task.id)
    emit('deleted', message || 'Solicitação excluída com sucesso.')
  } catch (error) {
    handleSaveError(error)
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>

<template>
  <DialogRoot v-model:open="dialogOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="detail-dialog fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[#D9E7F2] bg-white p-5 shadow-xl focus:outline-none sm:p-6"
      >
        <DialogTitle class="text-lg font-bold text-[#1E5A8A] sm:text-xl">
          Detalhes da solicitação
        </DialogTitle>
        <DialogDescription class="mt-1 text-sm text-[#6B7280]">
            {{ canEdit ? 'Consulte ou edite os dados da solicitação.' : 'Esta solicitação está disponível somente para consulta.' }}
        </DialogDescription>

        <div v-if="task" class="mt-5 grid gap-5">
          <dl class="grid gap-3 rounded-lg border border-[#D9E7F2] bg-[#F3F4F6] p-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Identificador</dt>
              <dd class="mt-1 break-all text-sm font-medium text-[#1F2937]">{{ task.id }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Data de criação</dt>
              <dd class="mt-1 text-sm font-medium text-[#1F2937]">{{ formatDate(task.createdAt) }}</dd>
            </div>
            <div v-if="task.updatedAt">
              <dt class="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Última atualização</dt>
              <dd class="mt-1 text-sm font-medium text-[#1F2937]">{{ formatDate(task.updatedAt) }}</dd>
            </div>
            <div v-if="task.usuario" class="min-w-0">
              <dt class="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Solicitante</dt>
              <dd class="mt-1 flex min-w-0 items-center gap-2">
                <Avatar class="size-8 shrink-0">
                  <AvatarImage
                    v-if="task.usuario.avatar"
                    :src="task.usuario.avatar"
                    :alt="task.usuario.name"
                  />
                  <AvatarFallback class="bg-[#3B7DB5] text-xs font-medium text-white">
                    {{ initials }}
                  </AvatarFallback>
                </Avatar>
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-[#1F2937]">{{ task.usuario.name }}</span>
                  <span class="block truncate text-xs text-[#6B7280]">{{ task.usuario.email }}</span>
                </span>
              </dd>
            </div>
          </dl>

          <form class="grid gap-4" @submit.prevent="save">
            <div class="grid gap-2">
              <label for="editar-solicitacao-titulo" class="text-sm font-semibold text-[#1F2937]">Título</label>
              <Input
                id="editar-solicitacao-titulo"
                v-model="title"
                :readonly="!canEdit"
                required
                maxlength="255"
                class="text-[#1F2937]"
              />
            </div>

            <div class="grid gap-2">
              <label for="editar-solicitacao-descricao" class="text-sm font-semibold text-[#1F2937]">Descrição completa</label>
              <textarea
                id="editar-solicitacao-descricao"
                v-model="description"
                :readonly="!canEdit"
                required
                rows="5"
                maxlength="1000"
                class="w-full resize-y rounded-md border border-[#D9E7F2] bg-white px-3 py-2 text-sm text-[#1F2937] shadow-xs outline-none placeholder:text-[#6B7280] focus-visible:border-[#3B7DB5] focus-visible:ring-3 focus-visible:ring-[#64A3D1]/40 read-only:cursor-default read-only:bg-[#F3F4F6]"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2">
                <label for="editar-solicitacao-categoria" class="text-sm font-semibold text-[#1F2937]">Categoria</label>
                <select
                  id="editar-solicitacao-categoria"
                  v-model="category"
                  :disabled="!canEdit"
                  required
                  class="h-10 w-full rounded-md border border-[#D9E7F2] bg-white px-3 text-sm text-[#1F2937] outline-none focus-visible:border-[#3B7DB5] focus-visible:ring-3 focus-visible:ring-[#64A3D1]/40 disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#6B7280]"
                >
                  <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>

              <div class="grid gap-2">
                <label for="editar-solicitacao-status" class="text-sm font-semibold text-[#1F2937]">Status</label>
                <select
                  id="editar-solicitacao-status"
                  v-model="status"
                  :disabled="!canEdit"
                  class="h-10 w-full rounded-md border border-[#D9E7F2] bg-white px-3 text-sm text-[#1F2937] outline-none focus-visible:border-[#3B7DB5] focus-visible:ring-3 focus-visible:ring-[#64A3D1]/40 disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#6B7280]"
                >
                  <option v-for="item in statuses" :key="item" :value="item">{{ item }}</option>
                </select>
                <p v-if="!canEdit" class="text-xs text-[#6B7280]">
                  Solicitações que não estão abertas não podem ser editadas.
                </p>
              </div>
            </div>

            <div
              v-if="errorMessage || Object.keys(validationErrors).length"
              role="alert"
              class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              <p v-if="errorMessage" class="font-medium">{{ errorMessage }}</p>
              <ul v-if="Object.keys(validationErrors).length" class="mt-1 list-inside list-disc space-y-1">
                <li v-for="(messages, field) in validationErrors" :key="field">
                  <span class="font-medium">{{ field }}:</span> {{ messages.join(' ') }}
                </li>
              </ul>
            </div>

            <div
              v-if="confirmDelete"
              class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
            >
              <p class="font-semibold">Excluir esta solicitação?</p>
              <p class="mt-1 text-red-800">Esta ação não pode ser desfeita.</p>
              <div class="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  class="text-[#1F2937]"
                  :disabled="isDeleting"
                  @click="confirmDelete = false"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  :disabled="isDeleting"
                  @click="remove"
                >
                  {{ isDeleting ? 'Excluindo…' : 'Confirmar exclusão' }}
                </Button>
              </div>
            </div>

            <div class="flex flex-col-reverse justify-between gap-2 pt-1 sm:flex-row">
              <DialogClose as-child>
                <Button
                  type="button"
                  variant="outline"
                  class="text-[#1F2937]"
                  :disabled="isSaving || isDeleting"
                >
                  Fechar
                </Button>
              </DialogClose>
              <div v-if="canEdit" class="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  class="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  :disabled="isSaving || isDeleting"
                  @click="confirmDelete = true"
                >
                  <Trash2 class="size-4" />
                  Excluir
                </Button>
                <Button
                  type="submit"
                  :disabled="isSaving || isDeleting || !category || !status"
                >
                  {{ isSaving ? 'Salvando…' : 'Salvar alterações' }}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.detail-dialog {
  color: #1f2937;
}
</style>
