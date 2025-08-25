<template>
    <div class="p-6">
        <h1 class="text-xl font-bold mb-4">Admin Panel</h1>
        <table class="min-w-full border">
            <thead>
                <tr class="bg-gray-200">
                    <th class="p-2 text-left">Email</th>
                    <th class="p-2">Role</th>
                    <th class="p-2">KYC Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="u in users" :key="u.id" class="border-t">
                    <td class="p-2">{{ u.email }}</td>
                    <td class="p-2">{{ u.role }}</td>
                    <td class="p-2">{{ u.kycStatus }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAllUsers } from "@/services/admin";

const users = ref([]);
onMounted(async () => {
    users.value = await getAllUsers();
});
</script>
