<template>
    <div class="flex min-h-screen bg-slate-50 text-slate-900">
        <!-- Sidebar (Navbar is a standalone, configurable SFC) -->
        <Navbar :items="navItems" :user="safeUser" :appName="appTitle" class="hidden lg:flex" @logout="handleLogout" />

        <!-- Main column -->
        <div class="flex-1 flex flex-col">
            <!-- Topbar -->
            <Topbar :appTitle="appTitle" :user="safeUser" :wallet="wallet" @logout="handleLogout"
                @toggle-mobile-nav="$emit('toggle-mobile-nav')" />

            <!-- Page content -->
            <main class="flex-1 overflow-auto p-6 lg:p-8">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar, { type NavItem } from '../components/Navbar.vue';
import Topbar from '../components/Topbar.vue';
import * as auth from '../services/auth';
import { useToast } from '../composables/useToast';

const toast = useToast();

// env / app identity
const appTitle = (import.meta.env.VUE_APP_TITLE ?? import.meta.env.VUE_APP_NAME ?? 'Crypto Platform') as string;
const appNameKey = (import.meta.env.VUE_APP_NAME ?? 'cryptocurrency-platform').toString().split(' ').join('').toLowerCase();

// storage keys used across app (consistent)
const ACCESS_KEY = `${appNameKey}_access`;
const USER_KEY = `${appNameKey}_user`;
const WALLET_KEY = `${appNameKey}_wallet`;

// nav items (config-driven)
const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Overview' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/settings', label: 'Settings' },
];

// reactive state
const safeUser = ref<any>(null);
const wallet = ref<any>(null);

// restore local state
function loadLocalState() {
    try {
        const u = localStorage.getItem(USER_KEY);
        safeUser.value = u ? JSON.parse(u) : null;
    } catch {
        safeUser.value = null;
    }

    try {
        const w = localStorage.getItem(WALLET_KEY);
        wallet.value = w ? JSON.parse(w) : null;
    } catch {
        wallet.value = null;
    }
}

async function refreshProfile() {
    try {
        const me = await auth.getMe();
        if (me) {
            safeUser.value = me;
            localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
    } catch (err: any) {
        // If unauthorized, don't crash: leave safeUser as-is and let page handle redirect.
        console.warn('[DashboardLayout] refreshProfile failed', err?.message ?? err);
    }
}

async function handleLogout() {
    try {
        await auth.logout(); // client-side service will call backend /auth/logout and clear tokens
    } catch {
        // ignore errors from server logout
    } finally {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(WALLET_KEY);
        safeUser.value = null;
        wallet.value = null;
        // navigate to login: router not imported here so emit an event or expect parent router to handle
        window.location.href = '/login';
    }
}

// wallet connect events (if your ConnectWallet emits events globally)
function onWalletConnected(e: any) {
    try {
        const detail = e?.detail ?? e;
        wallet.value = detail ?? wallet.value;
        localStorage.setItem(WALLET_KEY, JSON.stringify(wallet.value));
    } catch (err) {
        console.warn('wallet connected event parse failed', err);
    }
}
function onWalletDisconnected() {
    wallet.value = null;
    localStorage.removeItem(WALLET_KEY);
}

onMounted(() => {
    loadLocalState();
    refreshProfile();

    window.addEventListener('wallet:connected', onWalletConnected as EventListener);
    window.addEventListener('wallet:disconnected', onWalletDisconnected as EventListener);
});

onUnmounted(() => {
    window.removeEventListener('wallet:connected', onWalletConnected as EventListener);
    window.removeEventListener('wallet:disconnected', onWalletDisconnected as EventListener);
});
</script>

<style scoped>
/* keep minimal — styling handled by tailwind; add scrollbar style for consistent UX */
main::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

main::-webkit-scrollbar-thumb {
    background: rgba(2, 6, 23, 0.06);
    border-radius: 8px;
}
</style>
