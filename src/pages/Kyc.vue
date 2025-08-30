<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-center mb-6">KYC Verification</h1>

            <form @submit.prevent="submitKyc" class="space-y-5">
                <InputField id="firstName" label="First Name" v-model="firstName" placeholder="John" required />
                <InputField id="lastName" label="Last Name" v-model="lastName" placeholder="Doe" required />
                <InputField id="idNumber" label="National ID / Passport" v-model="idNumber" placeholder="ID number"
                    required />

                <!-- Country Select -->
                <div class="relative" ref="dropdownRef">
                    <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                        Country
                    </label>

                    <!-- Trigger -->
                    <button type="button" @click="toggleDropdown" @keydown.escape="openCountryDropdown = false"
                        class="w-full flex justify-between items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span class="truncate text-gray-900">
                            {{ country || "Select country" }}
                        </span>
                        <svg class="ml-2 h-4 w-4 text-gray-500 transform transition-transform"
                            :class="{ 'rotate-180': openCountryDropdown }" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 20 20" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                        </svg>
                    </button>

                    <!-- Dropdown -->
                    <transition name="fade">
                        <div v-if="openCountryDropdown"
                            class="absolute z-20 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                            role="listbox">
                            <input v-model="countrySearch" ref="searchInput" type="text" placeholder="Search country..."
                                class="w-full px-3 py-2 border-b text-sm focus:outline-none"
                                @keydown.down.prevent="highlightNext" @keydown.up.prevent="highlightPrev"
                                @keydown.enter.prevent="selectHighlighted" />

                            <ul class="max-h-48 overflow-y-auto">
                                <li v-for="(c, i) in filteredCountries" :key="c" role="option" @click="selectCountry(c)"
                                    class="cursor-pointer px-3 py-2 hover:bg-indigo-50" :class="{
                                        'bg-indigo-100 font-medium': c === country,
                                        'bg-indigo-200': highlightedIndex === i
                                    }">
                                    {{ c }}
                                </li>
                            </ul>
                        </div>
                    </transition>
                </div>

                <!-- File Upload -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Upload ID Document
                    </label>
                    <input type="file" @change="onFileChange" accept="image/*,application/pdf"
                        class="block w-full text-sm text-gray-600" />
                </div>

                <Button class="w-full" :disabled="loading">
                    {{ loading ? "Submitting..." : "Submit KYC" }}
                </Button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import api from "../services/api";
import InputField from "../components/InputField.vue";
import Button from "../components/Button.vue";
import { useToast } from "../composables/useToast";
import { useRouter } from "vue-router";
import { onClickOutside } from "@vueuse/core";

const firstName = ref("");
const lastName = ref("");
const idNumber = ref("");
const country = ref("");
const file = ref<File | null>(null);
const loading = ref(false);
const openCountryDropdown = ref(false);
const countrySearch = ref("");
const highlightedIndex = ref(-1);

const dropdownRef = ref(null);
const searchInput = ref<HTMLInputElement | null>(null);

const toast = useToast();
const router = useRouter();

// Example list, ideally fetch from backend
const countries = ["Kenya", "Uganda", "USA", "UK", "UAE"];

const filteredCountries = computed(() =>
    countries.filter((c) =>
        c.toLowerCase().includes(countrySearch.value.toLowerCase())
    )
);

function toggleDropdown() {
    openCountryDropdown.value = !openCountryDropdown.value;
    highlightedIndex.value = -1;
    if (openCountryDropdown.value) {
        nextTick(() => searchInput.value?.focus());
    }
}

function selectCountry(c: string) {
    country.value = c;
    openCountryDropdown.value = false;
    countrySearch.value = "";
}

function highlightNext() {
    if (highlightedIndex.value < filteredCountries.value.length - 1) {
        highlightedIndex.value++;
    }
}

function highlightPrev() {
    if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
    }
}

function selectHighlighted() {
    if (highlightedIndex.value >= 0) {
        selectCountry(filteredCountries.value[highlightedIndex.value]);
    }
}

function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] ?? null;
}

async function submitKyc() {
    if (!firstName.value || !lastName.value || !idNumber.value || !country.value) {
        toast.show("All fields are required", "warning");
        return;
    }

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append("firstName", firstName.value);
        formData.append("lastName", lastName.value);
        formData.append("idNumber", idNumber.value);
        formData.append("country", country.value);
        if (file.value) formData.append("document", file.value);

        await api.post("/kyc/submit", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        toast.show("KYC submitted successfully. Await verification.", "success");
        router.push("/dashboard");
    } catch (e: any) {
        toast.show(e?.response?.data?.message ?? "Failed to submit KYC.", "error");
    } finally {
        loading.value = false;
    }
}

onClickOutside(dropdownRef, () => {
    openCountryDropdown.value = false;
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
