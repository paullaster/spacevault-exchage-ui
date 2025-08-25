<template>
    <div class="w-full">
        <label :for="id" class="block text-sm font-medium text-gray-700 mb-1">
            {{ label }}
        </label>
        <input :id="id" :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :placeholder="placeholder" :aria-label="label" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    modelValue: string;
}>();

defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>
