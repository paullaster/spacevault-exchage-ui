<!-- src/pages/Admin.vue -->
<template>
    <div class="p-6 space-y-6">
        <header>
            <h1 class="text-2xl font-bold">Admin Panel</h1>
            <p class="text-sm text-gray-600">Manage platform users and monitor KYC status.</p>
        </header>

        <!-- Content -->
        <section class="bg-white rounded-xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th class="px-4 py-3">Email</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">KYC Status</th>
                            <th class="px-4 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="4" class="px-4 py-6 text-center text-gray-500">Loading users…</td>
                        </tr>
                        <tr v-else-if="error">
                            <td colspan="4" class="px-4 py-6 text-center text-red-600">{{ error }}</td>
                        </tr>
                        <tr v-else-if="users.length === 0">
                            <td colspan="4" class="px-4 py-6 text-center text-gray-500">No users found.</td>
                        </tr>
                        <tr v-for="u in users" :key="u.id" class="border-t hover:bg-gray-50">
                            <td class="px-4 py-3 font-medium">{{ u.email }}</td>
                            <td class="px-4 py-3">{{ u.role }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs rounded" :class="{
                                    'bg-green-100 text-green-700': u.kycStatus === 'approved',
                                    'bg-yellow-100 text-yellow-700': u.kycStatus === 'pending',
                                    'bg-red-100 text-red-700': u.kycStatus === 'rejected',
                                    'bg-gray-100 text-gray-600': !u.kycStatus
                                }">
                                    {{ u.kycStatus || 'unknown' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-gray-500">
                                {{ formatDate(u.createdAt) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../services/api";
import { useAuth } from "../composables/useAuth";

interface User {
    id: string;
    email: string;
    role: string;
    kycStatus?: string;
    createdAt: string;
}

const { isAdmin } = useAuth();

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function formatDate(date: string) {
    try {
        return new Date(date).toLocaleDateString();
    } catch {
        return "—";
    }
}

async function loadUsers() {
    if (!isAdmin.value) {
        error.value = "Access denied: Admins only.";
        return;
    }

    loading.value = true;
    error.value = null;
    try {
        const { data } = await api.get("/admin/users"); // ✅ API endpoint for admin user list
        users.value = Array.isArray(data) ? data : [];
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? e.message ?? "Failed to load users.";
    } finally {
        loading.value = false;
    }
}

onMounted(loadUsers);
</script>
