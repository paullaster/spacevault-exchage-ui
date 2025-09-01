<template>
    <header class="flex items-center justify-between px-4 lg:px-8 py-3 border-b bg-white">
        <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 rounded-md hover:bg-slate-100" @click="$emit('toggle-mobile-nav')"
                aria-label="Open menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div class="flex flex-col">
                <div class="text-sm font-semibold" v-text="appTitle" />
                <div class="text-xs text-gray-500">
                    <span>Welcome</span>
                    <span v-if="user?.email">, {{ user.email.split('@')[0] }}</span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <div class="hidden md:flex items-center gap-4">
                <div class="text-xs text-gray-500">KYC</div>
                <div :class="kycPillClass" class="text-xs font-medium px-2 py-1 rounded-md">
                    {{ (user?.kycStatus ?? 'UNKNOWN') }}
                </div>
            </div>

            <!-- ConnectWallet is expected to emit events to window and persist wallet into localStorage -->
            <ConnectWallet />

            <button class="px-3 py-1 rounded-md border text-sm hover:bg-slate-50" @click="onLogout" title="Sign out">
                Sign out
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ConnectWallet from '@/components/ConnectWallet.vue';
import { useToast } from '@/composables/useToast';
import type { PropType } from 'vue';

const props = defineProps({
    appTitle: { type: String, required: true },
    user: { type: Object as PropType<Record<string, any> | null>, default: null },
    wallet: { type: Object as PropType<Record<string, any> | null>, default: null },
});

const emit = defineEmits<{
    (e: 'logout'): void;
    (e: 'toggle-mobile-nav'): void;
}>();

const toast = useToast();

function onLogout() {
    emit('logout');
    toast.show('Logging out…', 'info');
}

const kycPillClass = computed(() => {
    const s = (props.user?.kycStatus ?? '').toString().toUpperCase();
    if (s === 'APPROVED') return 'bg-green-50 text-green-700';
    if (s === 'PENDING') return 'bg-yellow-50 text-yellow-700';
    if (s === 'REJECTED') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
});
</script>

<style scoped>
/* keep Topbar minimal and responsive — Tailwind handles the rest */
</style>
