<template>
    <div class="min-h-screen flex flex-col">
        <Navbar />
        <main class="flex-1 p-6 bg-gray-50">
            <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Account Card -->
                <div class="col-span-1 bg-white p-6 rounded-xl shadow">
                    <h2 class="text-lg font-semibold">Account</h2>
                    <p class="mt-2 text-sm text-gray-600">Email: {{ user?.email }}</p>
                    <p class="mt-1 text-sm">Role: {{ user?.role }}</p>
                    <p class="mt-3">
                        <span class="font-medium">KYC Status: </span>
                        <span :class="kycClass">{{ user?.kycStatus ?? 'unknown' }}</span>
                    </p>

                    <div class="mt-4">
                        <router-link v-if="user?.kycStatus !== 'approved'" to="/kyc"
                            class="text-indigo-600 hover:underline">
                            Complete KYC
                        </router-link>
                        <div v-else class="text-sm text-green-600">KYC completed — Wallet features enabled.</div>
                    </div>
                </div>

                <!-- Wallet & Balances -->
                <div class="col-span-2 space-y-6">
                    <div class="bg-white p-6 rounded-xl shadow flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold">Wallet</h3>
                            <p class="text-sm text-gray-600">Connect to a wallet to view balances and send funds.</p>
                        </div>
                        <ConnectWallet />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Native Balance -->
                        <div class="bg-white p-6 rounded-xl shadow">
                            <h3 class="text-lg font-semibold">Native Balance</h3>
                            <div class="mt-4">
                                <p v-if="!walletConnected" class="text-sm text-gray-500">Connect wallet to see balance.
                                </p>
                                <div v-else>
                                    <p class="text-2xl font-bold">{{ nativeBalance }} ETH</p>
                                </div>
                            </div>
                        </div>

                        <!-- ERC20 Balances -->
                        <div class="bg-white p-6 rounded-xl shadow md:col-span-2">
                            <h3 class="text-lg font-semibold">Token Balances</h3>
                            <div v-if="!walletConnected" class="mt-4 text-sm text-gray-500">Connect wallet to view
                                tokens.</div>
                            <div v-else class="mt-4 space-y-3">
                                <div v-for="t in tokenBalances" :key="t.address"
                                    class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">{{ t.symbol }} <span class="text-xs text-gray-400">({{
                                            t.address }})</span></div>
                                        <div class="text-xs text-gray-500">Balance: {{ t.balance }}</div>
                                    </div>
                                    <div class="text-right">
                                        <button class="text-sm px-3 py-1 border rounded"
                                            @click="prepareSendERC20(t)">Send</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Send Forms -->
                    <div class="bg-white p-6 rounded-xl shadow">
                        <h3 class="text-lg font-semibold">Transfer</h3>

                        <!-- Native send -->
                        <form @submit.prevent="sendNative" class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input v-model="nativeTo" placeholder="Recipient address"
                                class="col-span-2 border p-2 rounded" :disabled="!canTransact" />
                            <input v-model="nativeAmount" placeholder="Amount (ETH)" class="border p-2 rounded"
                                :disabled="!canTransact" />
                            <button class="md:col-span-3 px-4 py-2 bg-primary text-white rounded"
                                :disabled="!canTransact || sendingNative">
                                {{ sendingNative ? 'Sending...' : 'Send ETH' }}
                            </button>
                        </form>

                        <!-- ERC20 send -->
                        <form v-if="erc20Selected" @submit.prevent="sendERC20"
                            class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div class="col-span-2">
                                <label class="text-xs text-gray-600">Token</label>
                                <div class="p-2 border rounded">{{ erc20Selected.symbol }} ({{ erc20Selected.address }})
                                </div>
                            </div>
                            <input v-model="erc20To" placeholder="Recipient address" class="border p-2 rounded"
                                :disabled="!canTransact" />
                            <input v-model="erc20Amount" placeholder="Amount" class="border p-2 rounded"
                                :disabled="!canTransact" />
                            <button class="md:col-span-3 px-4 py-2 bg-primary text-white rounded"
                                :disabled="!canTransact || sendingErc20">
                                {{ sendingErc20 ? 'Sending...' : `Send ${erc20Selected?.symbol}` }}
                            </button>
                        </form>

                        <p v-if="!user || user.kycStatus !== 'approved'" class="text-xs text-red-600 mt-2">
                            You must complete and be approved for KYC to make transfers.
                        </p>

                        <p v-if="txResult" class="text-sm text-green-600 mt-2">Result: {{ txResult }}</p>
                    </div>

                    <!-- Transaction History (simple) -->
                    <div class="bg-white p-6 rounded-xl shadow">
                        <h3 class="text-lg font-semibold">Transaction History</h3>
                        <p class="mt-2 text-sm text-gray-500">Recent transactions from ledger or chain.</p>
                        <ul class="mt-3 space-y-2">
                            <li v-for="t in transactions" :key="t.hash" class="text-sm">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">{{ t.direction }} → {{ t.to }}</div>
                                        <div class="text-xs text-gray-500">Amount: {{ t.amount }} {{ t.symbol || 'ETH'
                                        }}</div>
                                    </div>
                                    <div class="text-xs text-gray-400">{{ t.time }}</div>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import ConnectWallet from '../components/ConnectWallet.vue';
import * as auth from '../services/auth';
import api from '../services/api';
import { getBalance, sendNativeTransfer, getERC20Balance, sendERC20 } from '../services/web3';

const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'));
const wallet = ref<any>(JSON.parse(localStorage.getItem('wallet') || 'null'));
const walletConnected = ref(!!wallet.value?.address);
const nativeBalance = ref('0.00');

// configure tokens you want to show (address + human label)
const TOKEN_LIST = [
    // Example token — replace with real token addresses for your target network
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', label: 'USDC (example)' },
    // Add more tokens as needed
];

const tokenBalances = ref<Array<{ address: string; symbol: string; balance: string }>>([]);
const erc20Selected = ref<any>(null);

const nativeTo = ref('');
const nativeAmount = ref('');
const erc20To = ref('');
const erc20Amount = ref('');

const sendingNative = ref(false);
const sendingErc20 = ref(false);
const txResult = ref('');
const transactions = ref<any[]>([]);

const canTransact = computed(() => user.value?.kycStatus === 'approved' && walletConnected.value);

const kycClass = computed(() => {
    const s = user.value?.kycStatus;
    if (s === 'approved') return 'text-green-600';
    if (s === 'rejected') return 'text-red-600';
    return 'text-yellow-600';
});

// helper load balances
async function loadNativeBalance() {
    try {
        if (!wallet.value?.address) return;
        nativeBalance.value = await getBalance(wallet.value.address);
    } catch (e) {
        console.error('Failed to load native balance', e);
    }
}

async function loadTokenBalances() {
    if (!wallet.value?.address) return;
    const arr: any[] = [];
    for (const t of TOKEN_LIST) {
        try {
            const r = await getERC20Balance(t.address, wallet.value.address);
            arr.push({ address: t.address, symbol: r.symbol, balance: r.balance });
        } catch (e) {
            console.warn('Token load failed', t.address, e);
        }
    }
    tokenBalances.value = arr;
}

// event listeners for wallet connect/disconnect
function onWalletConnected(e: any) {
    wallet.value = e.detail;
    walletConnected.value = true;
    localStorage.setItem('wallet', JSON.stringify(wallet.value));
    loadNativeBalance();
    loadTokenBalances();
}
function onWalletDisconnected() {
    wallet.value = null;
    walletConnected.value = false;
    nativeBalance.value = '0.00';
    tokenBalances.value = [];
    localStorage.removeItem('wallet');
}

onMounted(async () => {
    window.addEventListener('wallet:connected', onWalletConnected as EventListener);
    window.addEventListener('wallet:disconnected', onWalletDisconnected as EventListener);

    // if wallet already connected from previous session
    if (wallet.value?.address) {
        await loadNativeBalance();
        await loadTokenBalances();
    }

    // fetch user fresh (and start kyc polling if pending)
    if (localStorage.getItem('access')) {
        try {
            const me = await auth.getMe();
            user.value = me;
            localStorage.setItem('user', JSON.stringify(me));
        } catch (e) {
            console.error('Failed to refresh user', e);
        }
    }

    if (user.value?.kycStatus === 'pending') startKycPolling();

    // Try to fetch ledger txs (best-effort)
    try {
        const res = await api.get('/ledger/transactions?limit=10');
        transactions.value = res.data || [];
    } catch (e) {
        // ignore
    }
});

onUnmounted(() => {
    window.removeEventListener('wallet:connected', onWalletConnected as EventListener);
    window.removeEventListener('wallet:disconnected', onWalletDisconnected as EventListener);
    stopKycPolling();
});

let kycPollTimer: any = null;
function startKycPolling() {
    if (kycPollTimer) return;
    kycPollTimer = setInterval(async () => {
        try {
            const me = await auth.getMe();
            if (me.kycStatus !== user.value?.kycStatus) {
                user.value = me;
                localStorage.setItem('user', JSON.stringify(me));
                if (me.kycStatus === 'approved') {
                    alert('KYC approved — wallet features enabled.');
                    stopKycPolling();
                }
            }
        } catch (e) {
            console.error('KYC poll error', e);
        }
    }, 30_000); // 30 seconds
}
function stopKycPolling() {
    if (kycPollTimer) {
        clearInterval(kycPollTimer);
        kycPollTimer = null;
    }
}

// send native
async function sendNative() {
    if (!canTransact.value) { alert('KYC not approved or wallet not connected'); return; }
    sendingNative.value = true;
    try {
        const receipt = await sendNativeTransfer(nativeTo.value, nativeAmount.value);
        txResult.value = `ETH tx confirmed: ${receipt.transactionHash || receipt.hash || receipt.txHash}`;
        // optionally record in ledger
        await api.post('/ledger/record', {
            from: wallet.value.address,
            to: nativeTo.value,
            amount: nativeAmount.value,
            txHash: receipt.transactionHash || receipt.hash || receipt.txHash,
            symbol: 'ETH'
        }).catch(() => { });
        await loadNativeBalance();
    } catch (e: any) {
        alert(e?.message || 'Send failed');
    } finally {
        sendingNative.value = false;
    }
}

// select erc20
function prepareSendERC20(token: any) {
    erc20Selected.value = token;
    erc20Amount.value = '';
    erc20To.value = '';
    window.scrollTo({ top: 9999, behavior: 'smooth' });
}

async function sendERC20() {
    if (!canTransact.value || !erc20Selected.value) { alert('Not allowed'); return; }
    sendingErc20.value = true;
    try {
        const receipt = await sendERC20(erc20Selected.value.address, erc20To.value, erc20Amount.value);
        txResult.value = `${erc20Selected.value.symbol} tx confirmed: ${receipt.transactionHash || receipt.hash}`;
        // optional ledger record
        await api.post('/ledger/record', {
            from: wallet.value.address,
            to: erc20To.value,
            amount: erc20Amount.value,
            txHash: receipt.transactionHash || receipt.hash,
            symbol: erc20Selected.value.symbol
        }).catch(() => { });
        await loadTokenBalances();
    } catch (e: any) {
        alert(e?.message || 'ERC20 send failed');
    } finally {
        sendingErc20.value = false;
    }
}
</script>
