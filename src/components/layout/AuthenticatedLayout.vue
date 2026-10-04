<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Portal de Solicitações',
)
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-h-svh">
      <header class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <SidebarTrigger class="size-9 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary-hover)]" />
        <span class="h-6 w-px bg-border" aria-hidden="true" />
        <h1 class="truncate text-sm font-semibold text-foreground sm:text-base">
          {{ pageTitle }}
        </h1>
      </header>
      <main class="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
