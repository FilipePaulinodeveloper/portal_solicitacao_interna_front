<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ref } from "vue"
import { useAuth } from "@/composables/useAuth"
import router from "@/router"
import axios from "axios"

import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from '@lucide/vue'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const email = ref('') 
const password = ref('') 
const loading = ref(false) 
const errorMessage = ref('')
const validationErrors = ref<Record<string, string[]>>({})

const { login } = useAuth()

const handleLogin = async (event: Event) => {
  event.preventDefault()
  loading.value = true
  errorMessage.value = ''

  try {
    await login(email.value, password.value)    
  
    router.push('/')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data

      errorMessage.value = data?.mensagem

      validationErrors.value = data?.erros ?? {}
    }
    // errorMessage.value = error.message 
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card class="overflow-hidden p-0">
      <CardContent class="grid p-0 md:grid-cols-2">
        <form  @submit.prevent="handleLogin" class="p-6 md:p-8">
          <FieldGroup>
            <div class="flex flex-col items-center gap-2 text-center">
              <h1 class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold tracking-tight text-primary">
                  BIT
                </span>

                <span class="text-4xl font-extrabold tracking-tight text-slate-600">
                  SOLUÇÕES
                </span>
              </h1>
              <p class="text-muted-foreground text-balance">
                PORTAL DE SOLICITAÇÃO INTERNA
              </p>
            </div>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input
                v-model="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  Password
                </FieldLabel>
                <!-- <a
                  href="#"
                  class="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </a> -->
              </div>
             

              
              <Input v-model="password" id="password" type="password" required />
            </Field>
           <Alert
              v-if="errorMessage"
              variant="destructive"
            >
              <AlertCircleIcon />

              <AlertTitle>
                {{ errorMessage }}
              </AlertTitle>

              <AlertDescription
                v-if="Object.keys(validationErrors).length"
              >
                <ul class="mt-2 list-inside list-disc space-y-1">
                  <li
                    v-for="(messages, field) in validationErrors"
                    :key="field"
                  >
                    {{ messages[0] }}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
            <Field>
              <Button  type="submit" :disabled="loading" > {{ loading ? 'Entrando...' : 'Entrar' }} </button>
            </Field>
            
            
            <!-- <FieldDescription class="text-center">
              Don't have an account?
              <a href="#">
                Sign up
              </a>
            </FieldDescription> -->
          </FieldGroup>
        </form>
        <div class="bg-muted relative hidden md:block">
          <img
            src="../../assets/images/login-image.png"
            alt="Image"
            class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          >
        </div>
      </CardContent>
    </Card>
    <!-- <FieldDescription class="px-6 text-center">
      Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a>
      e <a href="#">Política de Privacidade</a>.
    </FieldDescription> -->
  </div>
</template>
