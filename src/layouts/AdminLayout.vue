<template>
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] bg-gray-50">
        <!-- Sidebar -->
        <aside class="bg-white border-r p-4 space-y-4">
            <h2 class="text-lg font-bold">Admin</h2>
            <nav class="space-y-1">
                <RouterLink to="/admin/health" class="block px-3 py-2 rounded hover:bg-gray-100"
                    :class="{ 'bg-gray-200': $route.path.startsWith('/admin/health') }">
                    Service Health
                </RouterLink>
                <RouterLink to="/admin/users" class="block px-3 py-2 rounded hover:bg-gray-100">
                    Users
                </RouterLink>
                <RouterLink to="/admin/kyc" class="block px-3 py-2 rounded hover:bg-gray-100">
                    KYC Review
                </RouterLink>
                <RouterLink to="/admin/ledger" class="block px-3 py-2 rounded hover:bg-gray-100">
                    Ledger
                </RouterLink>
            </nav>
        </aside>

        <!-- Main -->
        <main class="p-6">
            <RouterView />
        </main>
    </div>
</template>
<script setup lang="ts"></script>
