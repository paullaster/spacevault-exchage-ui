<template>
    <aside
        class="flex flex-col h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm">
        <!-- App Name / Logo -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h1 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {{ appName }}
            </h1>
        </div>

        <!-- Navigation Items -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <router-link v-for="item in items" :key="item.to" :to="item.to"
                class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-slate-800"
                :class="{
                    'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400':
                        isActive(item.to),
                    'text-slate-700 dark:text-slate-300': !isActive(item.to),
                }">
                <component v-if="item.icon" :is="item.icon" class="w-5 h-5 mr-3 text-slate-400"
                    :class="{ 'text-indigo-600 dark:text-indigo-400': isActive(item.to) }" />
                {{ item.label }}
            </router-link>
        </nav>

        <!-- User Info at Bottom -->
        <div v-if="user" class="px-4 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center">
            <img :src="user.avatar || defaultAvatar" alt="user avatar"
                class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {{ user.name || user.email }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {{ user.email }}
                </p>
            </div>
            <button @click="$emit('logout')"
                class="ml-2 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                Logout
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type { Component } from "vue";

export interface NavItem {
    to: string;
    label: string;
    icon?: Component;
}

defineProps<{
    items: NavItem[];
    user?: { name?: string; email: string; avatar?: string };
    appName: string;
}>();

const defaultAvatar =
    "https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff";

const route = useRoute();
function isActive(path: string) {
    return route.path.startsWith(path);
}
</script>
