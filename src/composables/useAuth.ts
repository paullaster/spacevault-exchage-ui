import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

type User = {
    id: string
    email: string
    roles: string[]
    kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'
}

const user = ref<User | null>(null)
const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))

let refreshPromise: Promise<void> | null = null

export function useAuth() {
    const router = useRouter()

    // --- State Getters ---
    const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
    const roles = computed(() => user.value?.roles ?? [])
    const isAdmin = computed(() => roles.value.includes('admin'))

    // --- API ---
    async function login(email: string, password: string) {
        const { data } = await api.post('/auth/login', { email, password })
        accessToken.value = data.accessToken
        refreshToken.value = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        await loadProfile()
    }

    function setUser(u: any) {
        user.value = u;
        if (u) {
            localStorage.setItem("user", JSON.stringify(u));
        } else {
            localStorage.removeItem("user");
        }
    }
    async function logout() {
        try {
            if (refreshToken.value) {
                await api.post('/auth/logout', { refreshToken: refreshToken.value })
            }
        } catch {
            // ignore
        }
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push({ name: 'Login' })
    }

    async function loadProfile() {
        try {
            const { data } = await api.get('/auth/me')
            user.value = data
        } catch (err: any) {
            console.warn('Failed to load profile', err)
            user.value = null
            if (err?.response?.status === 401) {
                await tryRefresh()
            }
        }
    }

    async function tryRefresh() {
        if (!refreshToken.value) {
            await logout()
            return
        }

        if (refreshPromise) return refreshPromise
        refreshPromise = (async () => {
            try {
                const { data } = await api.post('/auth/refresh', {
                    refreshToken: refreshToken.value,
                })
                accessToken.value = data.accessToken
                refreshToken.value = data.refreshToken
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
            } catch {
                await logout()
            } finally {
                refreshPromise = null
            }
        })()

        return refreshPromise
    }

    return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isAdmin,
        roles,
        login,
        logout,
        loadProfile,
        tryRefresh,
        setUser,
    }
}
