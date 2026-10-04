import type { Component } from 'vue'
import { ChartColumn } from '@lucide/vue'
import KanbanPageExample from '@/components/kanban/KanbanPage.example.vue'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/auth/Login.vue'
import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    icon?: Component
    sidebarLabel?: string
    sidebar?: boolean
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      component: AuthenticatedLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: {
            sidebarLabel: 'Dashboard',
            title: 'Dashboard',
            icon: ChartColumn,
          },
        },
        {
          path: 'solicitacoes',
          name: 'solicitacoes',
          component: KanbanPageExample,
          meta: {
            sidebarLabel: 'Solicitações',
            title: 'Solicitações',
          },
        },
      ],
    },
  ],
})

export default router