<script setup lang="ts">
import axios from 'axios'
import { ChevronsUpDown, ClipboardList, LogOut, PanelsTopLeft } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, getUser, logout } = useAuth()
const loadingUser = ref(false)
const loggingOut = ref(false)
const accountError = ref('')

const navigationItems = computed(() =>
  router.getRoutes()
    .filter((record) =>
      typeof record.name === 'string'
      && record.meta.sidebar !== false
      && typeof record.meta.sidebarLabel === 'string',
    )
    .map((record) => ({
      name: record.name as string,
      path: record.path,
      label: record.meta.sidebarLabel as string,
      icon: record.meta.icon ?? ClipboardList,
    }))
    .sort((first, second) => first.path.localeCompare(second.path)),
)

const userInitials = computed(() =>
  (user.value?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

function getAccountError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'object' && data !== null) {
      const responseData = data as Record<string, unknown>
      if (typeof responseData.mensagem === 'string') return responseData.mensagem
      if (typeof responseData.message === 'string') return responseData.message
    }
    return error.message || fallback
  }

  return error instanceof Error ? error.message : fallback
}

onMounted(async () => {
  
  if (user.value) return

  loadingUser.value = true
  try {
    await getUser()
  } catch (error) {
    accountError.value = getAccountError(error, 'Não foi possível carregar o usuário.')
  } finally {
    loadingUser.value = false
  }
})

async function handleLogout() {
  accountError.value = ''
  loggingOut.value = true

  try {
    await logout()
  } catch (error) {
    accountError.value = getAccountError(error, 'Não foi possível encerrar a sessão.')
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <Sidebar collapsible="icon" variant="sidebar">
    <SidebarHeader class="border-b border-sidebar-border px-3 py-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            size="lg"
            tooltip="Portal de Solicitações"
            class="h-12 cursor-default hover:bg-transparent hover:text-sidebar-foreground"
          >
            <RouterLink to="/solicitacoes" aria-label="Portal de Solicitações">
              <div class="flex size-9 shrink-0 items-center justify-start rounded-lg bg-[var(--kb-brand)] text-white">
                
                <svg
                
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3B7DB5"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <!-- Borda externa (semelhante ao retângulo original, mas adaptada ao formato do losango) -->
                  <path d="M12 2L2 12l10 10 10-10L12 2z"/>
                  
                  <!-- Losango interno preenchido (sólido como na imagem) -->
                  <path d="M12 6l-6 6 6 6 6-6z" fill="#3B7DB5" stroke="none"/>
                  
                  <!-- Linhas cruzadas internas -->
                  <!-- <path d="M12 6v12M6 12h12"/> -->
                  
                  <!-- Losango intermediário -->
                  <path d="M12 4l-8 8 8 8 8-8z" stroke-width="1"/>
                </svg>

              </div>
              <span class="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span class="truncate font-semibold">Portal de Solicitações</span>
                <span class="truncate text-xs font-normal text-sidebar-foreground/70">Área interna</span>
              </span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="px-2 py-3">
      <SidebarGroup class="p-0">
        <SidebarGroupLabel class="px-2">Navegação</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navigationItems" :key="item.name">
            <SidebarMenuButton
              as-child
              :is-active="route.path === item.path || route.path.startsWith(`${item.path}/`)"
              :tooltip="item.label"
            >
              <RouterLink :to="item.path">
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="mt-auto border-t border-sidebar-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="h-14 gap-2"
            :title="user ? `${user.name} (${user.email})` : 'Conta do usuário'"
          >
            <Avatar class="size-9 shrink-0">
              <AvatarImage
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.name"
              />
              <AvatarFallback class="bg-[var(--brand-primary)] text-xs font-semibold text-white">
                {{ userInitials || '' }}
              </AvatarFallback>
            </Avatar>
            <span class="grid min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
              <span class="truncate text-sm font-semibold">
                {{ loadingUser ? 'Carregando usuário…' : user?.name || '' }}
              </span>
              <span class="truncate text-xs font-normal text-sidebar-foreground/70">
                {{ user?.email || (loadingUser ? ' ' : '') }}
              </span>
            </span>
            <ChevronsUpDown class="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          :side-offset="8"
          class="w-64 border-[#D9E7F2] bg-white text-[#1F2937]"
        >
          <DropdownMenuLabel class="font-normal">
            <div class="flex min-w-0 items-center gap-3">
              <Avatar class="size-9 shrink-0">
                <AvatarImage
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                />
                <AvatarFallback class="bg-[var(--brand-primary)] text-xs font-semibold text-white">
                  {{ userInitials || '' }}
                </AvatarFallback>
              </Avatar>
              <span class="grid min-w-0">
                <span class="truncate text-sm font-semibold">
                  {{ user?.name || (loadingUser ? 'Carregando usuário…' : '' ) }}
                </span>
                <span class="truncate text-xs text-[#6B7280]">
                  {{ user?.email || '' }}
                </span>
              </span>
            </div>
          </DropdownMenuLabel>
          <p v-if="accountError" role="alert" class="m-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {{ accountError }}
          </p>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            :disabled="loggingOut"
            class="cursor-pointer"
            @select="handleLogout"
          >
            <LogOut class="size-4" />
            {{ loggingOut ? 'Saindo…' : 'Sair' }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
