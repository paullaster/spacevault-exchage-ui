<!-- src/App.vue -->
<template>
  <!-- Accessibility: skip link -->
  <a href="#main"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-3 py-2 rounded-md shadow">
    Skip to content
  </a>

  <div class="min-h-screen bg-gray-50 text-gray-900">
    <main id="main">
      <RouterView />
    </main>

    <footer class="py-6 text-center text-sm text-gray-500">
      © {{ year }} {{ appTitle }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";

const appTitle = (import.meta.env.VUE_APP_TITLE ?? import.meta.env.VUE_APP_NAME ?? 'Crypto Platform') as string;
const year = new Date().getFullYear();
</script>
