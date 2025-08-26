<template>
    <div class="rounded-2xl bg-white p-4 shadow">
        <div class="flex items-center justify-between">
            <h3 class="font-semibold">Service Health</h3>
            <button class="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" @click="refresh">
                Refresh
            </button>
        </div>
        <ul class="mt-3 space-y-2">
            <li v-for="svc in services" :key="svc.service" class="flex items-center justify-between">
                <span class="capitalize">{{ svc.service }}</span>
                <span :class="badgeClass(svc.status)" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ svc.status
                }}</span>
            </li>
        </ul>
        <p class="mt-2 text-xs text-gray-500">Last updated: {{ lastUpdated || '—' }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchHealthAll, type HealthStatus } from '../../services/health';

const services = ref<HealthStatus[]>([]);
const lastUpdated = ref<string>('');

function badgeClass(status: string) {
    return status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

async function refresh() {
    services.value = await fetchHealthAll();
    lastUpdated.value = new Date().toLocaleTimeString();
}

onMounted(refresh);
</script>
