<template>
    <transition enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="visible" :class="[
            'fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white',
            typeClass
        ]">
            <span v-if="icon" class="text-lg">{{ icon }}</span>
            <span>{{ message }}</span>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const props = defineProps<{
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
}>();

const visible = ref(true);

const typeClass = computed(() => {
    switch (props.type) {
        case "success":
            return "bg-green-600";
        case "error":
            return "bg-red-600";
        case "warning":
            return "bg-yellow-500 text-black";
        case "info":
            return "bg-blue-600";
        default:
            return "bg-gray-800";
    }
});

const icon = computed(() => {
    switch (props.type) {
        case "success":
            return "✅";
        case "error":
            return "❌";
        case "warning":
            return "⚠️";
        case "info":
            return "ℹ️";
        default:
            return "🔔";
    }
});

onMounted(() => {
    setTimeout(() => (visible.value = false), props.duration || 3000);
});
</script>
