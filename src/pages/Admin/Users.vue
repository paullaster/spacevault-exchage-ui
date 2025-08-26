<template>
    <div class="space-y-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold">Users</h1>
                <p class="text-sm text-gray-600">Manage users, roles and account status.</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm" @click="refresh"
                    :disabled="loading">
                    Refresh
                </button>
            </div>
        </header>

        <!-- Filters -->
        <section class="bg-white rounded-2xl shadow p-4">
            <form class="grid grid-cols-1 md:grid-cols-5 gap-3" @submit.prevent="applyFilters">
                <div class="md:col-span-2">
                    <label for="q" class="block text-xs font-semibold text-gray-600">Search</label>
                    <input id="q" v-model="query.q" type="search" placeholder="Name, email, userId"
                        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Role</label>
                    <select v-model="query.role" class="mt-1 w-full rounded-lg border px-3 py-2">
                        <option value="">Any</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="operator">Operator</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Status</label>
                    <select v-model="query.status" class="mt-1 w-full rounded-lg border px-3 py-2">
                        <option value="">Any</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">KYC</label>
                    <select v-model="query.kyc" class="mt-1 w-full rounded-lg border px-3 py-2">
                        <option value="">Any</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div class="md:col-span-5 flex justify-end gap-2">
                    <button type="button" class="px-3 py-2 rounded-lg text-sm" @click="resetFilters">Reset</button>
                    <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                        Apply
                    </button>
                </div>
            </form>
        </section>

        <!-- Table -->
        <section class="bg-white rounded-2xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-600">
                            <th class="px-4 py-3 cursor-pointer" @click="sortBy('email')">
                                Email
                                <SortIcon :active="sort.field === 'email'" :dir="sort.dir" />
                            </th>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3 cursor-pointer" @click="sortBy('role')">
                                Role
                                <SortIcon :active="sort.field === 'role'" :dir="sort.dir" />
                            </th>
                            <th class="px-4 py-3">KYC</th>
                            <th class="px-4 py-3 cursor-pointer" @click="sortBy('createdAt')">
                                Created
                                <SortIcon :active="sort.field === 'createdAt'" :dir="sort.dir" />
                            </th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">Loading…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="7" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">No users found.</td>
                        </tr>
                        <tr v-for="u in rows" :key="u.id" class="border-t">
                            <td class="px-4 py-3 font-medium">{{ u.email }}</td>
                            <td class="px-4 py-3">{{ u.firstName }} {{ u.lastName }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs" :class="u.role === 'admin' ? 'bg-purple-100 text-purple-800'
                                    : u.role === 'operator' ? 'bg-amber-100 text-amber-800'
                                        : 'bg-gray-100 text-gray-800'">
                                    {{ u.role }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs" :class="kycBadge(u.kycStatus)">
                                    {{ u.kycStatus ?? '—' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-gray-600">{{ formatDate(u.createdAt) }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs"
                                    :class="u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                    {{ u.status }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex justify-end gap-2">
                                    <button class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                        @click="openRole(u)">Role</button>
                                    <button class="px-2 py-1 rounded"
                                        :class="u.status === 'active' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'"
                                        @click="toggleStatus(u)">
                                        {{ u.status === 'active' ? 'Disable' : 'Enable' }}
                                    </button>
                                    <button class="px-2 py-1 rounded bg-white border hover:bg-gray-50"
                                        @click="impersonate(u)" :disabled="impersonating">
                                        Impersonate
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t">
                <p class="text-xs text-gray-500">
                    Showing {{ page.from }}–{{ page.to }} of {{ page.total }}
                </p>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1 rounded border" :disabled="query.page <= 1 || loading"
                        @click="goPage(query.page - 1)">Prev</button>
                    <span class="text-sm">Page {{ query.page }}</span>
                    <button class="px-3 py-1 rounded border" :disabled="page.to >= page.total || loading"
                        @click="goPage(query.page + 1)">Next</button>
                </div>
            </div>
        </section>

        <!-- Role Modal -->
        <div v-if="modals.role" class="fixed inset-0 bg-black/30 grid place-items-center z-50">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
                <h3 class="text-lg font-semibold mb-4">Change Role</h3>
                <p class="text-sm text-gray-600 mb-3">User: <strong>{{ selected?.email }}</strong></p>
                <select v-model="roleForm.role" class="w-full rounded-lg border px-3 py-2 mb-6">
                    <option value="user">User</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                </select>
                <div class="flex justify-end gap-2">
                    <button class="px-3 py-2 rounded hover:bg-gray-100" @click="closeRole">Cancel</button>
                    <button class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" @click="saveRole"
                        :disabled="saving">Save</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';

const API = import.meta.env.VUE_APP_API_BASE ?? 'http://localhost:3800/v1';

type User = {
    id: string; email: string; firstName?: string; lastName?: string;
    role: 'user' | 'operator' | 'admin';
    status: 'active' | 'disabled';
    kycStatus?: 'pending' | 'approved' | 'rejected';
    createdAt: string;
};

const loading = ref(false);
const error = ref<string | undefined>();
const rows = ref<User[]>([]);
const sort = reactive({ field: 'createdAt', dir: 'desc' as 'asc' | 'desc' });
const query = reactive({ q: '', role: '', status: '', kyc: '', page: 1, pageSize: 10 });
const page = reactive({ from: 0, to: 0, total: 0 });

const modals = reactive({ role: false });
const selected = ref<User | null>(null);
const roleForm = reactive({ role: 'user' });
const saving = ref(false);
const impersonating = ref(false);

function kycBadge(s?: string) {
    if (s === 'approved') return 'bg-green-100 text-green-800';
    if (s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
}

function formatDate(v: string) {
    return new Date(v).toLocaleString();
}

function sortBy(field: string) {
    if (sort.field === field) sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
    else { sort.field = field; sort.dir = 'asc'; }
    refresh();
}

async function fetchUsers() {
    loading.value = true; error.value = undefined;
    try {
        const { data } = await axios.get(`${API}/admin/users`, {
            params: { ...query, sort: `${sort.field}:${sort.dir}` },
        });
        rows.value = data.items;
        page.total = data.total;
        page.from = (query.page - 1) * query.pageSize + (rows.value.length ? 1 : 0);
        page.to = (query.page - 1) * query.pageSize + rows.value.length;
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? e.message ?? 'Failed to load users.';
    } finally {
        loading.value = false;
    }
}
function refresh() { fetchUsers(); }
function applyFilters() { query.page = 1; refresh(); }
function resetFilters() { query.q = ''; query.role = ''; query.status = ''; query.kyc = ''; query.page = 1; refresh(); }
function goPage(p: number) { query.page = p; refresh(); }

function openRole(u: User) { selected.value = u; roleForm.role = u.role; modals.role = true; }
function closeRole() { modals.role = false; selected.value = null; }

async function saveRole() {
    if (!selected.value) return;
    saving.value = true;
    try {
        await axios.patch(`${API}/admin/users/${selected.value.id}/role`, { role: roleForm.role });
        selected.value.role = roleForm.role as any;
        closeRole();
    } catch (e: any) {
        alert(e?.response?.data?.message ?? 'Failed to change role'); // replace with toast()
    } finally {
        saving.value = false;
    }
}

async function toggleStatus(u: User) {
    const next = u.status === 'active' ? 'disabled' : 'active';
    try {
        // optimistic
        // const prev = u.status; u.status = next as any;
        await axios.patch(`${API}/admin/users/${u.id}/status`, { status: next });
    } catch (e: any) {
        alert(e?.response?.data?.message ?? 'Failed to change status'); // toast()
        u.status = u.status === 'active' ? 'disabled' : 'active'; // revert
    }
}

async function impersonate(u: User) {
    impersonating.value = true;
    try {
        await axios.post(`${API}/admin/users/${u.id}/impersonate`);
        // backend should set impersonation token cookie or return new token
        location.href = '/dashboard';
    } catch (e: any) {
        alert(e?.response?.data?.message ?? 'Failed to impersonate'); // toast()
    } finally {
        impersonating.value = false;
    }
}

onMounted(refresh);
watch(() => [query.q, query.role, query.status, query.kyc], () => { query.page = 1; }, { deep: true });
</script>

<!-- lightweight sort indicator -->
<script lang="ts">
export default {
    components: {
        SortIcon: {
            props: { active: Boolean, dir: { type: String, default: 'asc' } },
            template: `
        <span aria-hidden="true" class="inline-block ml-1 text-gray-400" v-if="active">
          {{ dir === 'asc' ? '▲' : '▼' }}
        </span>
      `
        }
    }
}
</script>
