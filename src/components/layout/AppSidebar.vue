<script setup lang="ts">
import { ClipboardList, PanelsTopLeft } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const route = useRoute()
const router = useRouter()

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

    <SidebarRail />
  </Sidebar>
</template>
