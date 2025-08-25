<template>
    <button
        class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
        :disabled="disabled">
        <slot />
    </button>
</template>

<script setup lang="ts">
defineProps<{ disabled?: boolean }>();
</script>
