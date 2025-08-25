<template>
    <div class="space-y-6">
        <header>
            <h1 class="text-2xl font-bold">Ledger</h1>
            <p class="text-sm text-gray-600">Inspect accounts and entries (double-entry view).</p>
        </header>

        <!-- Tabs -->
        <div class="inline-flex rounded-lg border overflow-hidden">
            <button class="px-4 py-2 text-sm" :class="tab === 'accounts' ? 'bg-blue-600 text-white' : 'bg-white'"
                @click="switchTab('accounts')">Accounts</button>
            <button class="px-4 py-2 text-sm" :class="tab === 'entries' ? 'bg-blue-600 text-white' : 'bg-white'"
                @click="switchTab('entries')">Entries</button>
        </div>

        <!-- Filters -->
        <section class="bg-white rounded-2xl shadow p-4">
            <form class="grid grid-cols-1 md:grid-cols-6 gap-3" @submit.prevent="applyFilters">
                <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-600">User / Email / Account</label>
                    <input v-model="filters.q" type="search" class="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="Search…" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Currency</label>
                    <input v-model="filters.currency" type="text" class="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="USD, USDT, ETH" />
                </div>
                <div v-if="tab === 'entries'">
                    <label class="block text-xs font-semibold text-gray-600">Type</label>
                    <select v-model="filters.type" class="mt-1 w-full rounded-lg border px-3 py-2">
                        <option value="">Any</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                        <option value="trade">Trade</option>
                        <option value="fee">Fee</option>
                        <option value="adjustment">Adjustment</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">From</label>
                    <input v-model="filters.from" type="date" class="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">To</label>
                    <input v-model="filters.to" type="date" class="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div class="md:col-span-6 flex justify-end gap-2">
                    <button type="button" class="px-3 py-2 rounded-lg text-sm" @click="resetFilters">Reset</button>
                    <button type="submit"
                        class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Apply</button>
                </div>
            </form>
        </section>

        <!-- Accounts -->
        <section v-if="tab === 'accounts'" class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3">Account</th>
                            <th class="px-4 py-3">Owner</th>
                            <th class="px-4 py-3">Type</th>
                            <th class="px-4 py-3">Currency</th>
                            <th class="px-4 py-3 text-right">Balance</th>
                            <th class="px-4 py-3">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="6" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="accounts.length === 0">
                            <td colspan="6" class="px-4 py-6 text-center text-gray-500">No accounts found.</td>
                        </tr>
                        <tr v-for="a in accounts" :key="a.id" class="border-t">
                            <td class="px-4 py-3 font-medium">{{ a.id }}</td>
                            <td class="px-4 py-3">{{ a.user?.email ?? '—' }}</td>
                            <td class="px-4 py-3">{{ a.type }}</td>
                            <td class="px-4 py-3">{{ a.currency }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(a.balance) }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ formatDate(a.updatedAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Pager :page="query.page" :pageSize="query.pageSize" :total="page.total" :loading="loading" @go="goPage" />
        </section>

        <!-- Entries -->
        <section v-else class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="flex items-center justify-between p-3 border-b">
                <div class="text-sm text-gray-600">Double-entry lines. Each transaction appears as ≥2 postings.</div>
                <button class="px-3 py-1 rounded border text-sm" @click="exportCsv" :disabled="loading">Download
                    CSV</button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3">Entry ID</th>
                            <th class="px-4 py-3">TxId</th>
                            <th class="px-4 py-3">Account</th>
                            <th class="px-4 py-3 text-right">Debit</th>
                            <th class="px-4 py-3 text-right">Credit</th>
                            <th class="px-4 py-3">Currency</th>
                            <th class="px-4 py-3">Type</th>
                            <th class="px-4 py-3">When</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="8" class="px-4 py-6 text-center text-gray-500">Loading…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="8" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="entries.length === 0">
                            <td colspan="8" class="px-4 py-6 text-center text-gray-500">No entries found.</td>
                        </tr>
                        <tr v-for="e in entries" :key="e.id" class="border-t">
                            <td class="px-4 py-3 font-medium">{{ e.id }}</td>
                            <td class="px-4 py-3">{{ e.txId }}</td>
                            <td class="px-4 py-3">{{ e.accountId }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(e.debit) }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(e.credit) }}</td>
                            <td class="px-4 py-3">{{ e.currency }}</td>
                            <td class="px-4 py-3">{{ e.type }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ formatDate(e.createdAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Pager :page="query.page" :pageSize="query.pageSize" :total="page.total" :loading="loading" @go="goPage" />
        </section>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/v1';

type AccountRow = {
    id: string; userId?: string; user?: { email: string };
    type: 'user' | 'fee' | 'reserve' | 'provider';
    currency: string; balance: string | number; updatedAt: string;
};
type EntryRow = {
    id: string; txId: string; accountId: string;
    debit: string | number; credit: string | number;
    currency: string; type: string; createdAt: string;
};

const tab = ref<'accounts' | 'entries'>('accounts');
const loading = ref(false);
const error = ref<string | undefined>();
const accounts = ref<AccountRow[]>([]);
const entries = ref<EntryRow[]>([]);
const query = reactive({ page: 1, pageSize: 20 });
const page = reactive({ total: 0 });
const filters = reactive({ q: '', currency: '', type: '', from: '', to: '' });

function switchTab(t: 'accounts' | 'entries') { tab.value = t; query.page = 1; refresh(); }
function formatDate(v: string) { return new Date(v).toLocaleString(); }
function formatAmount(x: any) { const n = Number(x ?? 0); return isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 8 }); }

async function loadAccounts() {
    const { data } = await axios.get(`${API}/ledger/accounts`, { params: { ...filters, ...query } });
    accounts.value = data.items; page.total = data.total;
}
async function loadEntries() {
    const { data } = await axios.get(`${API}/ledger/entries`, { params: { ...filters, ...query } });
    entries.value = data.items; page.total = data.total;
}
async function refresh() {
    loading.value = true; error.value = undefined;
    try { tab.value === 'accounts' ? await loadAccounts() : await loadEntries(); }
    catch (e: any) { error.value = e?.response?.data?.message ?? e.message ?? 'Failed to load ledger.'; }
    finally { loading.value = false; }
}
function applyFilters() { query.page = 1; refresh(); }
function resetFilters() { filters.q = ''; filters.currency = ''; filters.type = ''; filters.from = ''; filters.to = ''; query.page = 1; refresh(); }
function goPage(p: number) { query.page = p; refresh(); }

function exportCsv() {
    const items = tab.value === 'accounts' ? accounts.value : entries.value;
    const cols = tab.value === 'accounts'
        ? ['id', 'user.email', 'type', 'currency', 'balance', 'updatedAt']
        : ['id', 'txId', 'accountId', 'debit', 'credit', 'currency', 'type', 'createdAt'];
    const lines = [cols.join(',')];
    for (const it of items as any[]) {
        const line = cols.map(c => {
            const path = c.split('.');
            let v: any = it;
            for (const p of path) v = v?.[p];
            if (v == null) v = '';
            return `"${String(v).replace(/"/g, '""')}"`;
        }).join(',');
        lines.push(line);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ledger-${tab.value}.csv`; a.click();
    URL.revokeObjectURL(url);
}

onMounted(refresh);
</script>

<script lang="ts">
export default {
    components: {
        Pager: {
            props: { page: Number, pageSize: Number, total: Number, loading: Boolean },
            emits: ['go'],
            computed: {
                disabledPrev(): boolean { return (this.page ?? 1) <= 1 || this.loading; },
                disabledNext(): boolean {
                    const p = this.page ?? 1, sz = this.pageSize ?? 20, tot = this.total ?? 0;
                    return p * sz >= tot || this.loading;
                }
            },
            template: `
        <div class="flex items-center justify-between p-4 border-t">
          <p class="text-xs text-gray-500">Total: {{ total }}</p>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 rounded border" :disabled="disabledPrev" @click="$emit('go', (page||1)-1)">Prev</button>
            <span class="text-sm">Page {{ page }}</span>
            <button class="px-3 py-1 rounded border" :disabled="disabledNext" @click="$emit('go', (page||1)+1)">Next</button>
          </div>
        </div>
      `
        }
    }
}
</script>
