<template>
    <div class="p-6 space-y-6">
        <h1 class="text-2xl font-bold">Service Health Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <transition-group name="fade" tag="div" class="contents">
                <div v-for="svc in services" :key="svc.service"
                    class="p-4 rounded-2xl shadow bg-white flex flex-col justify-between transition">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-semibold capitalize">{{ svc.service }}</h2>
                        <span class="px-2 py-1 text-xs font-bold rounded-full transition-colors duration-500" :class="svc.status === 'up'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'">
                            {{ svc.status }}
                        </span>
                    </div>

                    <div class="mt-2 text-sm text-gray-600">
                        <pre v-if="svc.details" class="overflow-x-auto text-xs">{{ svc.details }}</pre>
                        <p v-if="svc.error" class="text-red-500 text-xs">Error: {{ svc.error }}</p>
                    </div>
                </div>
            </transition-group>
        </div>

        <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500">Last updated: {{ lastUpdated }}</p>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" @click="refresh">
                Refresh Now
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchHealthAll, type HealthStatus } from '../../services/health';

const services = ref<HealthStatus[]>([]);
const lastUpdated = ref<string>('never');

let intervalId: NodeJS.Timeout | null = null;

async function refresh() {
    try {
        services.value = await fetchHealthAll();
        lastUpdated.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Failed to load health:', err);
    }
}

onMounted(() => {
    refresh();
    intervalId = setInterval(refresh, 10000); // auto-refresh every 10s
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
/* Smooth enter/leave animations */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
