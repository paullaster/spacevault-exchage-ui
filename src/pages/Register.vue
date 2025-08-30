<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-center mb-6">Register</h1>

            <form @submit.prevent="handleRegister" class="space-y-4" novalidate>
                <InputField id="email" label="Email" v-model="email" type="email" placeholder="you@example.com" />
                <InputField id="password" label="Password" v-model="password" type="password" placeholder="********" />
                <Button :disabled="loading">{{ loading ? "Creating..." : "Register" }}</Button>
            </form>

            <p class="mt-4 text-center text-sm">
                Already have an account?
                <router-link to="/login" class="text-indigo-600 hover:underline">Login</router-link>
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
import { useToast } from '../composables/useToast';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const toast = useToast();

async function handleRegister() {
    loading.value = true;
    try {
        await auth.register(email.value, password.value);
        toast.show("Registration successful!");
        const token = localStorage.getItem('access');
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // go to KYC if user exists
        router.push('/kyc');
    } catch (e: any) {
        console.error(e);
        toast.show(e?.response.data?.message?.message || e?.message || 'Registration failed.');
    } finally {
        loading.value = false;
    }
}
</script>
