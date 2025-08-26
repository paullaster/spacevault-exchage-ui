<template>
    <div class="space-y-6">
        <header>
            <h1 class="text-2xl font-bold">Ledger</h1>
            <p class="text-sm text-gray-600">Inspect accounts and entries (double-entry view).</p>
        </header>

        <!-- Tabs -->
        <div class="inline-flex rounded-lg border overflow-hidden">
            <button class="px-4 py-2 text-sm" :class="tab === 'accounts' ? 'bg-blue-600 text-white' : 'bg-white'"
                @click="switchTab('accounts')" :disabled="loading">
                Accounts
            </button>
            <button class="px-4 py-2 text-sm" :class="tab === 'entries' ? 'bg-blue-600 text-white' : 'bg-white'"
                @click="switchTab('entries')" :disabled="loading">
                Entries
            </button>
        </div>

        <!-- Filters -->
        <section class="bg-white rounded-2xl shadow p-4">
            <form @submit.prevent="applyFilters" class="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-600">User / Email / Account</label>
                    <input v-model="filters.q" type="search" class="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="Search…" aria-label="Search user email or account" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-gray-600">Currency</label>
                    <input v-model="filters.currency" type="text" class="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="USD, USDT, ETH" aria-label="Currency" />
                </div>

                <div v-if="tab === 'entries'">
                    <label class="block text-xs font-semibold text-gray-600">Type</label>
                    <select v-model="filters.type" class="mt-1 w-full rounded-lg border px-3 py-2"
                        aria-label="Entry type">
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
                    <button type="button" class="px-3 py-2 rounded-lg text-sm" @click="resetFilters"
                        :disabled="loading">
                        Reset
                    </button>
                    <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                        :disabled="loading">
                        Apply
                    </button>
                </div>
            </form>
        </section>

        <!-- Accounts -->
        <section v-if="tab === 'accounts'" class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('id')">Account</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('user.email')">Owner</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('type')">Type</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('currency')">Currency</th>
                            <th class="px-4 py-3 text-right cursor-pointer" @click="toggleSort('balance')">Balance</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('updatedAt')">Updated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">Loading…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="7" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="accounts.length === 0">
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">No accounts found.</td>
                        </tr>

                        <template v-else v-for="a in accounts" :key="a.id">
                            <tr class="border-t">
                                <td class="px-4 py-3 font-medium">{{ a.id ?? '—' }}</td>
                                <td class="px-4 py-3">{{ a.user?.email ?? '—' }}</td>
                                <td class="px-4 py-3">{{ a.type ?? '—' }}</td>
                                <td class="px-4 py-3">{{ a.currency ?? '—' }}</td>
                                <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(a.balance) }}</td>
                                <td class="px-4 py-3 text-gray-600">{{ formatDate(a.updatedAt) }}</td>
                                <td class="px-4 py-3 text-right">
                                    <button class="px-2 py-1 text-xs border rounded" @click="toggleExpand(a.id)">
                                        {{ expanded[a.id] ? 'Hide' : 'Show' }} Entries
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="expanded[a.id]" class="bg-gray-50">
                                <td colspan="7" class="px-4 py-3">
                                    <div v-if="!expandedData[a.id] && !loadingExpanded[a.id]">
                                        <button class="px-3 py-1 text-sm rounded border"
                                            @click="loadAccountEntries(a.id)">
                                            Load entries
                                        </button>
                                    </div>
                                    <div v-else-if="loadingExpanded[a.id]" class="text-gray-500">Loading entries…</div>
                                    <div v-else-if="expandedData[a.id]?.length === 0" class="text-gray-500">No entries
                                        for this account.</div>
                                    <table v-else class="min-w-full text-xs mt-2 border">
                                        <thead class="bg-gray-100">
                                            <tr>
                                                <th class="px-2 py-1">Entry ID</th>
                                                <th class="px-2 py-1">Debit</th>
                                                <th class="px-2 py-1">Credit</th>
                                                <th class="px-2 py-1">Currency</th>
                                                <th class="px-2 py-1">When</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="e in expandedData[a.id]" :key="e.id">
                                                <td class="px-2 py-1">{{ e.id }}</td>
                                                <td class="px-2 py-1">{{ formatAmount(e.debit) }}</td>
                                                <td class="px-2 py-1">{{ formatAmount(e.credit) }}</td>
                                                <td class="px-2 py-1">{{ e.currency ?? '—' }}</td>
                                                <td class="px-2 py-1">{{ formatDate(e.createdAt) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <Pager :page="query.page" :pageSize="query.pageSize" :total="page.total" :loading="loading" @go="goPage" />
        </section>

        <!-- Entries -->
        <section v-else class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="flex items-center justify-between p-3 border-b">
                <div class="text-sm text-gray-600">Double-entry lines. Each transaction appears as ≥2 postings.</div>
                <button class="px-3 py-1 rounded border text-sm" @click="exportCsv"
                    :disabled="loading || exportDisabled">
                    Download CSV
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('id')">Entry ID</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('txId')">TxId</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('accountId')">Account</th>
                            <th class="px-4 py-3 text-right cursor-pointer" @click="toggleSort('debit')">Debit</th>
                            <th class="px-4 py-3 text-right cursor-pointer" @click="toggleSort('credit')">Credit</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('currency')">Currency</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('type')">Type</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('createdAt')">When</th>
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
                        <tr v-else v-for="e in entries" :key="e.id" class="border-t">
                            <td class="px-4 py-3 font-medium">{{ e.id ?? '—' }}</td>
                            <td class="px-4 py-3">{{ e.txId ?? '—' }}</td>
                            <td class="px-4 py-3">{{ e.accountId ?? '—' }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(e.debit) }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(e.credit) }}</td>
                            <td class="px-4 py-3">{{ e.currency ?? '—' }}</td>
                            <td class="px-4 py-3">{{ e.type ?? '—' }}</td>
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
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuth } from '../../composables/useAuth';
// import { useToast } from '../../composables/useToast';

// --- Guards ---
const { user } = useAuth();
const router = useRouter();
if (!user.value?.roles?.includes('admin')) {
    router.replace({ name: 'Forbidden' }); // redirect to error page
}

// --- State ---
const tab = ref<'accounts' | 'entries'>('accounts');
const query = reactive({ page: 1, pageSize: 20, sort: '' });
const filters = reactive({ q: '', currency: '', type: '', from: '', to: '' });
const loading = ref(false);
const error = ref<string | null>(null);

const accounts = ref<any[]>([]);
const entries = ref<any[]>([]);
const page = reactive({ total: 0 });

// expanded rows
const expanded = reactive<Record<string, boolean>>({});
const expandedData = reactive<Record<string, any[]>>({});
const loadingExpanded = reactive<Record<string, boolean>>({});

// helpers
function toggleExpand(id: string) {
    expanded[id] = !expanded[id];
}
async function loadAccountEntries(accountId: string) {
    loadingExpanded[accountId] = true;
    try {
        const { data } = await api.get(`/ledger/accounts/${accountId}/entries`);
        expandedData[accountId] = data.items || [];
    } catch (e: any) {
        expandedData[accountId] = [];
    } finally {
        loadingExpanded[accountId] = false;
    }
}

// --- Sorting ---
function toggleSort(field: string) {
    if (query.sort.startsWith(field)) {
        query.sort = query.sort.endsWith(':asc') ? `${field}:desc` : `${field}:asc`;
    } else {
        query.sort = `${field}:asc`;
    }
    refresh();
}

// --- Filters persistence ---
const route = useRoute();
function syncFromRoute() {
    const { tab: t, page: pg, sort, ...f } = route.query;
    if (t === 'entries' || t === 'accounts') tab.value = t;
    if (pg) query.page = Number(pg) || 1;
    if (sort) query.sort = String(sort);
    Object.assign(filters, f);
}
function syncToRoute() {
    router.replace({
        query: { ...filters, tab: tab.value, page: query.page, sort: query.sort },
    });
}
watch([tab, () => query.page, () => query.sort, filters], syncToRoute, { deep: true });
onMounted(syncFromRoute);

// --- Load ---
async function refresh() {
    loading.value = true;
    error.value = null;
    try {
        const params = { ...filters, page: query.page, pageSize: query.pageSize, sort: query.sort };
        if (tab.value === 'accounts') {
            const { data } = await api.get('/ledger/accounts', { params });
            accounts.value = data.items || [];
            page.total = data.total || accounts.value.length;
        } else {
            const { data } = await api.get('/ledger/entries', { params });
            entries.value = data.items || [];
            page.total = data.total || entries.value.length;
        }
    } catch (e: any) {
        error.value = e.response?.data?.message ?? e.message;
    } finally {
        loading.value = false;
    }
}
onMounted(refresh);

// --- Controls ---
function switchTab(t: 'accounts' | 'entries') {
    tab.value = t;
    query.page = 1;
    refresh();
}
function applyFilters() {
    query.page = 1;
    refresh();
}
function resetFilters() {
    filters.q = '';
    filters.currency = '';
    filters.type = '';
    filters.from = '';
    filters.to = '';
    query.page = 1;
    refresh();
}
function goPage(p: number) {
    query.page = p;
    refresh();
}

// --- Helpers ---
function formatDate(v?: string) {
    return v ? new Date(v).toLocaleString() : '—';
}
function formatAmount(v: any) {
    const n = Number(v);
    return isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}
const exportDisabled = computed(() => (tab.value === 'accounts' ? accounts.value.length === 0 : entries.value.length === 0));
function exportCsv() {
    const items = tab.value === 'accounts' ? accounts.value : entries.value;
    if (!items.length) return;
    const cols = tab.value === 'accounts'
        ? ['id', 'user.email', 'type', 'currency', 'balance', 'updatedAt']
        : ['id', 'txId', 'accountId', 'debit', 'credit', 'currency', 'type', 'createdAt'];
    const rows = [cols.join(',')];
    for (const it of items) {
        const line = cols.map(c => {
            const path = c.split('.');
            let v: any = it;
            for (const p of path) v = v?.[p];
            return `"${String(v ?? '').replace(/"/g, '""')}"`;
        }).join(',');
        rows.push(line);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ledger-${tab.value}.csv`; a.click();
    URL.revokeObjectURL(url);
}
</script>
