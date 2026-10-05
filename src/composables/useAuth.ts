import { ref } from 'vue'
import router from '../router'
import api from '../services/api'

export interface AuthUser {
  id: string | number
  name: string
  email: string
  avatar?: string | null
}

const user = ref<AuthUser | null>(null)

function parseAuthUser(value: unknown): AuthUser {
  if (typeof value !== 'object' || value === null) {
    throw new Error('A API retornou os dados do usuário em formato inválido.')
  }

  const candidate = value as Record<string, unknown>
  if (
    (typeof candidate.id !== 'string' && typeof candidate.id !== 'number')
    || typeof candidate.name !== 'string'
    || typeof candidate.email !== 'string'
    || (candidate.avatar !== undefined && candidate.avatar !== null && typeof candidate.avatar !== 'string')
  ) {
    throw new Error('A API retornou os dados do usuário em formato inválido.')
  }

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    avatar: typeof candidate.avatar === 'string' || candidate.avatar === null
      ? candidate.avatar
      : undefined,
  }
}

export function useAuth() {

  async function login(email: string, password: string) {
    const response = await api.post('/login', {
      email,
      password,
    })

    localStorage.setItem('token', response.data.token)

    user.value = parseAuthUser(response.data.user)
    router.push('/dashboard')
    return response.data
  }

  async function logout() {
    await api.post('/logout')

    localStorage.removeItem('token')

    user.value = null

    router.push('/login')
  }

 async function getUser() {
    const response = await api.get('/user')

    const data = response.data?.dados?.data[0]
    console.log('getUser response.data:', response.data?.dados?.data)
    user.value = parseAuthUser(data)

    return data
  }

  async function isAuthenticated() {
    try {
      await getUser()
      return true
    } catch {
      user.value = null
      return false
    }
  }

  return {
    user,
    login,
    logout,
    getUser,
    isAuthenticated,
  }
}