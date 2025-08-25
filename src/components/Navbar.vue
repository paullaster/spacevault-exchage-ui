<template>
    <nav class="flex items-center justify-between bg-white shadow px-6 py-4">
        <div class="text-lg font-semibold">CryptoApp</div>
        <router-link v-if="user?.role === 'admin'" to="/admin/health" class="px-3 py-2 rounded hover:bg-gray-200">
            Health Dashboard
        </router-link>

        <div class="flex items-center gap-4">

            <div v-if="user" class="text-sm">
                <div class="font-medium">{{ user.email }}</div>
                <div class="text-xs text-gray-500">{{ user.role }}</div>
            </div>
            <button class="text-sm text-gray-700 hover:text-indigo-600" @click="onLogout">Logout</button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as auth from '../services/auth';

const router = useRouter();
const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'));

async function onLogout() {
    auth.logout();
    router.push('/login');
}
</script>
