<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold">Admin Overview</h1>
        <HealthWidget />
        <!-- Add more quick cards: recent users, pending KYCs, error rate, etc. -->
    </div>
</template>
<script setup lang="ts">
import HealthWidget from '@/components/admin/HealthWidget.vue';
</script>
