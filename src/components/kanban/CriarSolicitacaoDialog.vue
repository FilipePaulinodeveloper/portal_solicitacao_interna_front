<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
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
import { Categorias } from '@/enums/categoria'
import { criarSolicitacao } from '@/services/solicitacoes'

const emit = defineEmits<{
  created: [message: string]
}>()

const isOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const title = ref('')
const description = ref('')
const category = ref<Categorias | ''>('')
const categories = Object.values(Categorias)

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

function handleSubmitError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
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
        errorMessage.value = 'A API recusou o cadastro. Confira os detalhes abaixo.'
        return
      }
    }

    errorMessage.value = error.message || 'Não foi possível cadastrar a solicitação.'
    return
  }

  errorMessage.value = error instanceof Error
    ? error.message
    : 'Não foi possível cadastrar a solicitação.'
}

function resetForm() {
  title.value = ''
  description.value = ''
  category.value = ''
  errorMessage.value = ''
  validationErrors.value = {}
}

function clearErrors() {
  errorMessage.value = ''
  validationErrors.value = {}
}

async function submit() {
  if (!category.value) return

  isSubmitting.value = true
  clearErrors()

  try {
    const message = await criarSolicitacao({
      titulo: title.value.trim(),
      descricao: description.value.trim(),
      categoria: category.value,
    })
    isOpen.value = false
    resetForm()
    emit('created', message)
  } catch (error) {
    handleSubmitError(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DialogRoot v-model:open="isOpen" >
    <button
      type="button"
      class="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-light)] focus-visible:ring-offset-2 sm:w-auto"
      @click="isOpen = true; clearErrors()"
    >
      <Plus class="size-4" />
      Nova solicitação
    </button>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="create-dialog fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-white p-6 shadow-lg focus:outline-none"
      >
        <DialogTitle class="dialog-title text-lg text-[var(--kb-ink)]">
          Criar solicitação
        </DialogTitle>
        <DialogDescription class="dialog-description mt-1 text-sm text-[var(--kb-muted)]">
          Preencha os dados para registrar uma nova solicitação.
        </DialogDescription>

        <form class="mt-6 pt-4 space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <label for="solicitacao-titulo">Título</label>
            <Input
              id="solicitacao-titulo"
              v-model="title"
              required
              maxlength="255"
              autocomplete="off"
              placeholder="Digite o título"
              class="dialog-input"
              
              
            />
          </div>

          <div class="space-y-2 pt-4">
            <label for="solicitacao-descricao">Descrição</label>
            <textarea
              id="solicitacao-descricao"
              v-model="description"
              required
              rows="4"
              class="dialog-input w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Descreva a solicitação"
              maxlength="1000"
            />
          </div>

          <div class="space-y-2 pt-4">
            <label for="solicitacao-categoria">Categoria</label>
            <select
              id="solicitacao-categoria"
              v-model="category"
              required
              class="dialog-input h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option v-for="item in categories" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div
            v-if="errorMessage || Object.keys(validationErrors).length"
            role="alert"
            class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            <p v-if="errorMessage" class="font-medium">{{ errorMessage }}</p>
            <ul
              v-if="Object.keys(validationErrors).length"
              class="mt-1 list-inside list-disc space-y-1"
            >
              <li v-for="(messages, field) in validationErrors" :key="field">
                <span class="font-medium">{{ field }}:</span> {{ messages.join(' ') }}
              </li>
            </ul>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <DialogClose as-child>
              <Button type="button" variant="outline" class="dialog-cancel" :disabled="isSubmitting">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" :disabled="isSubmitting || !category">
              {{ isSubmitting ? 'Cadastrando…' : 'Cadastrar' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.create-dialog {
  color: #1f2937;
}

.dialog-title {
  color: #1f2937;
  font-weight: 700;
}

.dialog-description {
  color: #4b5563;
}

.create-dialog label {
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 600;
}

.dialog-input {
  color: #1f2937;
}

.dialog-input::placeholder {
  color: #6b7280;
  opacity: 1;
}

.dialog-cancel {
  color: #374151;
}
</style>
