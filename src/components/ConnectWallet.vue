<!-- <template>
    <div class="flex items-center gap-4">
        <div v-if="connected" class="text-sm">
            <div class="font-medium">{{ shortAddress }}</div>
            <div class="text-xs text-gray-500">Chain: {{ chainId }}</div>
        </div>

        <button v-if="!connected" @click="connect"
            class="px-3 py-2 rounded-md bg-primary hover:bg-primary-dark text-white" aria-label="Connect wallet">
            Connect Wallet
        </button>

        <button v-else @click="disconnect" class="px-3 py-2 rounded-md border">
            Disconnect
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { connectWallet } from '../services/web3';

const connected = ref(false);
const address = ref('');
const chainId = ref<number | null>(null);

const shortAddress = computed(() => {
  if (!address.value) return '';
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

function appName() {
  let appName = import.meta.env.VUE_APP_NAME || "Cryptocurrency Platform";
  appName = appName.split(" ").join("").toLowerCase();
  return appName;
}

async function connect() {
  try {
    const info = await connectWallet();
    address.value = info.address;
    chainId.value = info.chainId;
    connected.value = true;
    // persist to local storage for use in app
    localStorage.setItem(`${appName()}_wallet`, JSON.stringify({ address: info.address, chainId: info.chainId }));
  } catch (e) {
    alert((e as Error).message);
  }
}

function disconnect() {
  connected.value = false;
  address.value = '';
  chainId.value = null;
  localStorage.removeItem(`${appName()}_wallet`);
}
</script> -->

<template>
  <div class="flex items-center gap-4">
    <div v-if="connected" class="text-sm">
      <div class="font-medium">{{ shortAddress }}</div>
      <div class="text-xs text-gray-500">Chain: {{ chainId }}</div>
    </div>

    <button v-if="!connected" @click="connect" class="px-3 py-2 rounded-md bg-primary hover:bg-primary-dark text-white"
      aria-label="Connect wallet">
      Connect Wallet
    </button>

    <button v-else @click="disconnect" class="px-3 py-2 rounded-md border">
      Disconnect
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { connectWallet } from '../services/web3';

const connected = ref(false);
const address = ref('');
const chainId = ref<number | null>(null);

const shortAddress = computed(() => {
  if (!address.value) return '';
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

function appName() {
  let appName = import.meta.env.VUE_APP_NAME || "Cryptocurrency Platform";
  appName = appName.split(" ").join("").toLowerCase();
  return appName;
}
async function connect() {
  try {
    const info = await connectWallet();
    address.value = info.address;
    chainId.value = info.chainId;
    connected.value = true;
    localStorage.setItem(`${appName()}_wallet`, JSON.stringify({ address: info.address, chainId: info.chainId }));
    // emit custom event so parent components can react
    window.dispatchEvent(new CustomEvent('wallet:connected', { detail: { address: info.address, chainId: info.chainId } }));
  } catch (e: any) {
    alert(e?.message || 'Failed to connect wallet');
  }
}

function disconnect() {
  connected.value = false;
  address.value = '';
  chainId.value = null;
  localStorage.removeItem(`${appName()}_wallet`);
  window.dispatchEvent(new Event('wallet:disconnected'));
}

onMounted(() => {
  const w = JSON.parse(localStorage.getItem(`${appName()}_wallet`) || 'null');
  if (w?.address) {
    address.value = w.address;
    chainId.value = w.chainId;
    connected.value = true;
  }
});
</script>
