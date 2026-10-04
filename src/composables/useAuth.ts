import { ref } from 'vue'
import router from '../router'
import api from '../services/api'

const user = ref(null)

export function useAuth() {

  async function login(email: string, password: string) {
    const response = await api.post('/api/login', {
      email,
      password,
    })

    localStorage.setItem('token', response.data.token)

    user.value = response.data.user

    return response.data
  }

  async function logout() {
    await api.post('/api/logout')

    localStorage.removeItem('token')

    user.value = null

    router.push('/login')
  }

  async function getUser() {
    const response = await api.get('/api/user')

    user.value = response.data

    return response.data
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