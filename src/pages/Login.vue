<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

            <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
                <InputField id="email" label="Email" v-model="email" type="email" placeholder="you@example.com" />
                <InputField id="password" label="Password" v-model="password" type="password" placeholder="********" />
                <label class="flex items-center text-sm gap-2">
                    <input type="checkbox" v-model="remember" class="w-4 h-4" />
                    <span>Remember me (creates refresh token)</span>
                </label>

                <Button :disabled="loading">{{ loading ? "Logging in..." : "Login" }}</Button>
            </form>

            <p class="mt-4 text-center text-sm">
                Don’t have an account?
                <router-link to="/register" class="text-indigo-600 hover:underline">Register</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputField from '../components/InputField.vue';
import Button from '../components/Button.vue';
import * as auth from '../services/auth';
import api from '../services/api';

const email = ref('');
const password = ref('');
const remember = ref(true);
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
    loading.value = true;
    try {
        // call login which stores tokens and fetches user
        await auth.login(email.value, password.value);
        // set axios auth header shortcut
        const token = localStorage.getItem('access');
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        router.push('/dashboard');
    } catch (e: any) {
        console.error(e);
        const msg = e?.response?.data?.message || e?.message || 'Login failed';
        alert(msg);
    } finally {
        loading.value = false;
    }
}
</script>
