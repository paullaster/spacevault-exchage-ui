<template>
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left column -->
        <section class="lg:col-span-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-white rounded-xl shadow">
                    <div class="text-xs text-gray-500">Native Balance</div>
                    <div class="mt-2 text-2xl font-semibold">{{ nativeBalanceDisplay }}</div>
                    <div class="mt-2 text-xs text-gray-400">Network: {{ wallet?.chain ?? '—' }}</div>
                </div>

                <div class="p-4 bg-white rounded-xl shadow">
                    <div class="text-xs text-gray-500">Tokens</div>
                    <div class="mt-2 text-lg font-semibold">{{ tokenBalances.length }} tracked</div>
                    <div class="mt-2 text-xs text-gray-400">Quick send available when KYC approved</div>
                </div>

                <div class="p-4 bg-white rounded-xl shadow">
                    <div class="text-xs text-gray-500">Recent Activity</div>
                    <div class="mt-2 text-lg font-semibold">{{ transactions.length }}</div>
                    <div class="mt-2 text-xs text-gray-400">Ledger + chain</div>
                </div>
            </div>

            <!-- Balances & transactions -->
            <div class="bg-white rounded-xl shadow p-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Token Balances</h3>
                    <div class="text-xs text-gray-500">Auto-refresh every 30s</div>
                </div>

                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <ul class="space-y-3">
                            <li v-for="t in tokenBalances" :key="t.address ?? t.symbol"
                                class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium">{{ t.symbol ?? '—' }}</div>
                                    <div class="text-xs text-gray-500">{{ t.address ?? '' }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-semibold">{{ t.balance ?? '0' }}</div>
                                    <div class="mt-2 flex gap-2 justify-end">
                                        <button @click="$emit('send-token', t)" :disabled="!canTransact"
                                            class="px-3 py-1 rounded border text-xs">Send</button>
                                        <button @click="$emit('view-token', t)"
                                            class="px-3 py-1 rounded border text-xs">View</button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-sm text-gray-600">Recent Transactions</h4>
                        <ul class="mt-3 space-y-2">
                            <li v-for="tx in transactions.slice(0, 6)" :key="tx.hash ?? tx.txHash"
                                class="flex items-center justify-between">
                                <div class="text-sm">
                                    <div class="font-medium">{{ tx.direction ?? 'Tx' }} → {{ short(tx.to) }}</div>
                                    <div class="text-xs text-gray-500">{{ tx.symbol ?? 'ETH' }} • {{ tx.amount ?? '?' }}
                                    </div>
                                </div>
                                <div class="text-xs text-gray-400">{{ tx.time ?? '' }}</div>
                            </li>
                            <li v-if="!transactions.length" class="text-xs text-gray-400">No recent transactions</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Transfer card-->
            <div class="bg-white rounded-xl shadow p-4">
                <h3 class="text-lg font-semibold">Transfer</h3>
                <p class="text-xs text-gray-500 mt-1">Native and token transfers. KYC must be approved to send funds.
                </p>

                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input v-model="nativeTo" placeholder="Recipient address" class="col-span-2 border p-2 rounded"
                        :disabled="!canTransact" />
                    <input v-model="nativeAmount" placeholder="Amount (ETH)" class="border p-2 rounded"
                        :disabled="!canTransact" />
                    <button class="md:col-span-3 px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
                        :disabled="!canTransact || sendingNative" @click="sendNative">
                        {{ sendingNative ? 'Sending...' : 'Send ETH' }}
                    </button>
                </div>

                <p v-if="!canTransact" class="text-xs text-red-600 mt-3">KYC approval and wallet connection required to
                    transact.</p>
                <p v-if="txResult" class="text-sm text-green-600 mt-2">Result: {{ txResult }}</p>
            </div>
        </section>

        <!-- Right column -->
        <aside class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-xl shadow p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-sm text-gray-500">Account</h4>
                        <div class="mt-1 text-sm font-medium">{{ safeUser?.email ?? '—' }}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Role</div>
                        <div class="text-sm font-medium">{{ safeUser?.role ?? 'user' }}</div>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-2 gap-2">
                    <button @click="gotoKyc" class="px-3 py-2 rounded border text-sm">KYC Center</button>
                    <button @click="openAdmin" class="px-3 py-2 rounded border text-sm" v-if="isAdmin">Admin</button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4">
                <h4 class="text-sm text-gray-500">Quick Actions</h4>
                <div class="mt-3 grid grid-cols-2 gap-3">
                    <button @click="refreshAll" class="px-3 py-2 rounded border text-sm">Refresh</button>
                    <button @click="copyAddress" class="px-3 py-2 rounded border text-sm"
                        :disabled="!wallet?.address">Copy Address</button>
                    <button @click="openExplorer" class="px-3 py-2 rounded border text-sm"
                        :disabled="!wallet?.address">Explorer</button>
                    <button @click="downloadCsv" class="px-3 py-2 rounded border text-sm">Export CSV</button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow p-4">
                <h4 class="text-sm text-gray-500">Support</h4>
                <p class="text-xs text-gray-600 mt-2">Questions? Contact support or read the docs in Settings.</p>
                <div class="mt-3">
                    <button @click="openSupport" class="px-3 py-2 rounded border text-sm">Contact Support</button>
                </div>
            </div>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useToast } from '../composables/useToast';
import { isAddress } from 'ethers';

const toast = useToast();
const router = useRouter();

// keys consistent with layout
const appNameKey = (import.meta.env.VUE_APP_NAME ?? 'cryptocurrency-platform').toString().split(' ').join('').toLowerCase();
const USER_KEY = `${appNameKey}_user`;
const WALLET_KEY = `${appNameKey}_wallet`;

// reactive state
const safeUser = ref<any>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
const wallet = ref<any>(JSON.parse(localStorage.getItem(WALLET_KEY) || 'null'));

const nativeBalance = ref<string>('0.00');
const tokenBalances = ref<Array<{ address?: string; symbol?: string; balance?: string }>>([]);
const transactions = ref<any[]>([]);

const nativeTo = ref<string>('');
const nativeAmount = ref<string>('');
// const erc20Selected = ref<any | null>(null);
// const erc20To = ref<string>('');
// const erc20Amount = ref<string>('');
const sendingNative = ref(false);
// const sendingErc20 = ref(false);
const txResult = ref<string>('');

const canTransact = computed(() => !!(safeUser.value?.kycStatus === 'APPROVED' && wallet.value?.address));
const isAdmin = computed(() => (safeUser.value?.role ?? '').toString().toUpperCase() === 'ADMIN');

const nativeBalanceDisplay = computed(() => nativeBalance.value ?? '0.00');

function short(s?: string) {
    if (!s) return '—';
    return String(s).slice(0, 6) + '...' + String(s).slice(-4);
}

async function loadTransactions() {
    try {
        const res = await api.get('/ledger/transactions?limit=10');
        transactions.value = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
    } catch {
        transactions.value = [];
    }
}

async function loadTokenBalances() {
    try {
        // try ledger or chain (best-effort) — simple placeholder here
        tokenBalances.value = [];
        const res = await api.get('/wallet/tokens'); // optional server-backed endpoint if you have it
        tokenBalances.value = Array.isArray(res?.data) ? res.data : [];
    } catch {
        tokenBalances.value = [];
    }
}

async function loadNativeBalance() {
    try {
        const res = await api.get('/wallet/balance');
        nativeBalance.value = res?.data?.balance ?? '0.00';
    } catch {
        nativeBalance.value = '0.00';
    }
}

async function refreshAll() {
    await Promise.all([loadNativeBalance(), loadTokenBalances(), loadTransactions()]);
    toast.show('Refreshed', 'success');
}

function gotoKyc() { router.push('/kyc'); }
function openAdmin() { router.push('/admin'); }
function downloadCsv() { toast.show('Export started (not implemented)', 'info'); }
function openSupport() { toast.show('Contact support via support@company.example', 'info'); }

function copyAddress() {
    if (!wallet?.value?.address) return toast.show('No address', 'warning');
    navigator.clipboard?.writeText(wallet.value.address).then(() => toast.show('Address copied', 'success')).catch(() => toast.show('Copy failed', 'error'));
}

function openExplorer() {
    if (!wallet?.value?.address) return toast.show('No address', 'warning');
    const explorer = import.meta.env.VUE_EXPLORER_URL ?? 'https://etherscan.io/address';
    window.open(`${explorer}/${wallet.value.address}`, '_blank');
}

async function sendNative() {
    if (!canTransact.value) { toast.show('KYC not approved or wallet not connected', 'error'); return; }
    if (!nativeTo.value || !nativeAmount.value) { toast.show('Recipient and amount required', 'warning'); return; }
    if (!isAddress(nativeTo.value)) { toast.show('Invalid recipient address', 'error'); return; }

    sendingNative.value = true;
    try {
        // Delegate to ConnectWallet / Web3 service; for now call backend to create withdrawal or
        // use direct wallet flow via injected provider. We keep this abstract for testability.
        const res = await api.post('/wallet/send/native', { to: nativeTo.value, amount: nativeAmount.value }).catch(() => null);
        if (res?.data?.txHash) {
            txResult.value = `ETH tx submitted: ${res.data.txHash}`;
            toast.show('Transaction submitted', 'success');
        } else {
            throw new Error('Submission failed');
        }
        await refreshAll();
    } catch (err: any) {
        toast.show(err?.message ?? 'Send failed', 'error');
    } finally {
        sendingNative.value = false;
    }
}

onMounted(async () => {
    await refreshAll();
    // safe load from localStorage if services not available
    try { const u = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); safeUser.value = u; } catch { }
    try { const w = JSON.parse(localStorage.getItem(WALLET_KEY) || 'null'); wallet.value = w; } catch { }
});
</script>

<style scoped>
/* small tweaks if needed */
</style>
