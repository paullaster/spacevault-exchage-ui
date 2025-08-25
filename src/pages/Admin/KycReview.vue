<template>
    <div class="space-y-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold">KYC Review</h1>
                <p class="text-sm text-gray-600">Review and decide on user KYC submissions.</p>
            </div>
            <div class="flex gap-2">
                <button class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm" @click="refresh"
                    :disabled="loading">Refresh</button>
            </div>
        </header>

        <!-- Tabs & Filters -->
        <section class="bg-white rounded-2xl shadow p-4">
            <div class="flex flex-wrap items-center gap-3">
                <div class="inline-flex rounded-lg border overflow-hidden">
                    <button class="px-4 py-2 text-sm" :class="tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white'"
                        @click="switchTab('pending')">Pending</button>
                    <button class="px-4 py-2 text-sm" :class="tab === 'all' ? 'bg-blue-600 text-white' : 'bg-white'"
                        @click="switchTab('all')">All</button>
                </div>
                <div class="ml-auto flex gap-2">
                    <input v-model="filters.q" type="search" placeholder="Email, name, idNumber"
                        class="rounded-lg border px-3 py-2 w-64" />
                    <select v-model="filters.status" class="rounded-lg border px-3 py-2">
                        <option value="">Any status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                        @click="applyFilters">Apply</button>
                    <button class="px-3 py-2 rounded-lg text-sm" @click="resetFilters">Reset</button>
                </div>
            </div>
        </section>

        <!-- Table -->
        <section class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3">User</th>
                            <th class="px-4 py-3">ID Number</th>
                            <th class="px-4 py-3">Country</th>
                            <th class="px-4 py-3">Submitted</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="6" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td colspan="6" class="px-4 py-6 text-center text-gray-500">No submissions found.</td>
                        </tr>
                        <tr v-for="k in rows" :key="k.id" class="border-t">
                            <td class="px-4 py-3">
                                <div class="font-medium">{{ k.user?.email ?? '—' }}</div>
                                <div class="text-gray-500 text-xs">{{ k.firstName }} {{ k.lastName }}</div>
                            </td>
                            <td class="px-4 py-3">{{ k.idNumber }}</td>
                            <td class="px-4 py-3">{{ k.country }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ formatDate(k.submittedAt ?? k.createdAt) }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs" :class="statusBadge(k.status)">{{ k.status
                                }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex justify-end gap-2">
                                    <button class="px-2 py-1 rounded bg-white border hover:bg-gray-50"
                                        @click="openDetails(k)">View</button>
                                    <button v-if="k.status === 'pending'"
                                        class="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                        @click="approve(k)">Approve</button>
                                    <button v-if="k.status === 'pending'"
                                        class="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                        @click="reject(k)">Reject</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t">
                <p class="text-xs text-gray-500">Showing {{ page.from }}–{{ page.to }} of {{ page.total }}</p>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1 rounded border" :disabled="query.page <= 1 || loading"
                        @click="goPage(query.page - 1)">Prev</button>
                    <span class="text-sm">Page {{ query.page }}</span>
                    <button class="px-3 py-1 rounded border" :disabled="page.to >= page.total || loading"
                        @click="goPage(query.page + 1)">Next</button>
                </div>
            </div>
        </section>

        <!-- Drawer -->
        <div v-if="drawer.open" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/30" @click="closeDrawer"></div>
            <aside class="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-xl p-6 overflow-y-auto">
                <header class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-semibold">KYC Details</h3>
                        <p class="text-xs text-gray-500">{{ drawer.item?.user?.email }}</p>
                    </div>
                    <button class="p-2 rounded hover:bg-gray-100" @click="closeDrawer" aria-label="Close">✕</button>
                </header>
                <div class="mt-4 space-y-3">
                    <Field label="Name" :value="`${drawer.item?.firstName ?? ''} ${drawer.item?.lastName ?? ''}`" />
                    <Field label="ID Number" :value="drawer.item?.idNumber" />
                    <Field label="Country" :value="drawer.item?.country" />
                    <Field label="Submitted At"
                        :value="formatDate(drawer.item?.submittedAt ?? drawer.item?.createdAt)" />
                    <Field label="Status" :value="drawer.item?.status" />
                    <div v-if="drawer.item?.documents?.length" class="mt-4">
                        <h4 class="font-semibold mb-2">Documents</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li v-for="d in drawer.item?.documents" :key="d.id">
                                <a :href="d.url" target="_blank" class="text-blue-600 hover:underline">{{ d.type }}
                                    (view)</a>
                            </li>
                        </ul>
                    </div>
                    <div v-if="drawer.item?.status === 'pending'" class="mt-6 flex gap-2">
                        <button class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                            @click="approve(drawer.item!)">Approve</button>
                        <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            @click="reject(drawer.item!)">Reject</button>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Reject Modal -->
        <div v-if="modals.reject" class="fixed inset-0 bg-black/30 grid place-items-center z-50">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
                <h3 class="text-lg font-semibold mb-2">Reject KYC</h3>
                <p class="text-sm text-gray-600 mb-4">Provide a reason (visible to user).</p>
                <textarea v-model="rejectForm.reason" rows="3" class="w-full rounded-lg border px-3 py-2 mb-4"
                    placeholder="Reason for rejection"></textarea>
                <div class="flex justify-end gap-2">
                    <button class="px-3 py-2 rounded hover:bg-gray-100" @click="modals.reject = false">Cancel</button>
                    <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="confirmReject"
                        :disabled="saving">Reject</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';

const API = import.meta.env.VUE_APP_API_BASE ?? 'http://localhost:3800/v1';

type KycRow = {
    id: string;
    userId: string;
    user?: { email: string };
    firstName: string; lastName: string;
    idNumber: string; country: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; submittedAt?: string;
    documents?: { id: string; type: string; url: string }[];
};

const loading = ref(false);
const error = ref<string | undefined>();
const rows = ref<KycRow[]>([]);
const query = reactive({ page: 1, pageSize: 10 });
const page = reactive({ from: 0, to: 0, total: 0 });
const tab = ref<'pending' | 'all'>('pending');
const filters = reactive({ q: '', status: '' });

const drawer = reactive<{ open: boolean, item: KycRow | null }>({ open: false, item: null });
const modals = reactive({ reject: false });
const saving = ref(false);
const rejectForm = reactive({ id: '', reason: '' });

function statusBadge(s: string) {
    return s === 'approved' ? 'bg-green-100 text-green-800'
        : s === 'rejected' ? 'bg-red-100 text-red-800'
            : 'bg-amber-100 text-amber-800';
}
function formatDate(v?: string) { return v ? new Date(v).toLocaleString() : '—'; }

async function fetchKyc() {
    loading.value = true; error.value = undefined;
    try {
        const { data } = await axios.get(`${API}/admin/kyc`, {
            params: { ...query, tab: tab.value, q: filters.q, status: filters.status }
        });
        rows.value = data.items;
        page.total = data.total;
        page.from = (query.page - 1) * query.pageSize + (rows.value.length ? 1 : 0);
        page.to = (query.page - 1) * query.pageSize + rows.value.length;
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? e.message ?? 'Failed to load KYC.';
    } finally {
        loading.value = false;
    }
}
function refresh() { fetchKyc(); }
function goPage(p: number) { query.page = p; refresh(); }
function switchTab(t: 'pending' | 'all') { tab.value = t; query.page = 1; refresh(); }
function applyFilters() { query.page = 1; refresh(); }
function resetFilters() { filters.q = ''; filters.status = ''; query.page = 1; refresh(); }

function openDetails(k: KycRow) { drawer.item = k; drawer.open = true; }
function closeDrawer() { drawer.open = false; drawer.item = null; }

async function approve(k: KycRow) {
    saving.value = true;
    try {
        await axios.post(`${API}/admin/kyc/${k.id}/approve`);
        k.status = 'approved';
        // optional toast success
    } catch (e: any) {
        alert(e?.response?.data?.message ?? 'Approve failed');
    } finally {
        saving.value = false;
    }
}
function reject(k: KycRow) {
    rejectForm.id = k.id; rejectForm.reason = ''; modals.reject = true;
}
async function confirmReject() {
    if (!rejectForm.id) return;
    saving.value = true;
    try {
        await axios.post(`${API}/admin/kyc/${rejectForm.id}/reject`, { reason: rejectForm.reason });
        const row = rows.value.find(r => r.id === rejectForm.id);
        if (row) row.status = 'rejected';
        modals.reject = false;
    } catch (e: any) {
        alert(e?.response?.data?.message ?? 'Reject failed');
    } finally {
        saving.value = false;
    }
}

onMounted(refresh);
</script>

<script lang="ts">
export default {
    components: {
        Field: {
            props: { label: String, value: [String, Number] },
            template: `
        <div>
          <div class="text-xs text-gray-500">{{ label }}</div>
          <div class="text-sm">{{ value || '—' }}</div>
        </div>
      `
        }
    }
}
</script>
