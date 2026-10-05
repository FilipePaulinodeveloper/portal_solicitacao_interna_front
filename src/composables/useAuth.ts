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
const userIdStorageKey = 'user_id'

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
    
    const authenticatedUser = parseAuthUser(response.data.user)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem(userIdStorageKey, String(authenticatedUser.id))

    user.value = authenticatedUser
    router.push('/dashboard')
    return response.data
  }

  async function logout() {
    await api.post('/logout')

    localStorage.removeItem('token')
    localStorage.removeItem(userIdStorageKey)

    user.value = null

    router.push('/login')
  }

  async function getUser() {
    const userId = user.value?.id ?? localStorage.getItem(userIdStorageKey)
    if (userId === null) {
      throw new Error('Não foi possível identificar o usuário logado.')
    }

    const response = await api.get<unknown>(`/user/${encodeURIComponent(String(userId))}`)
    const responseData = response.data
    const data = typeof responseData === 'object'
      && responseData !== null
      && 'dados' in responseData
      ? responseData.dados
      : responseData
    const currentUser = parseAuthUser(data)

    user.value = currentUser

    return currentUser
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