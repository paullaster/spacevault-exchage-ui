<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-center mb-6">KYC Verification</h1>

            <form @submit.prevent="submitKyc" class="space-y-4">
                <InputField id="fullName" label="Full Name" v-model="fullName" placeholder="Your full legal name" />
                <InputField id="nationalId" label="National ID / Passport" v-model="idNumber" placeholder="ID number" />

                <label class="block text-sm font-medium text-gray-700">Upload Document</label>
                <input type="file" @change="onFileChange" class="block w-full text-sm text-gray-600" />

                <Button :disabled="loading">{{ loading ? "Submitting..." : "Submit KYC" }}</Button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "../services/api";
import InputField from "../components/InputField.vue";
import Button from "../components/Button.vue";
import { useToast } from "../composables/useToast";

const fullName = ref("");
const idNumber = ref("");
const file = ref<File | null>(null);
const loading = ref(false);
const toast = useToast();

function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    file.value = target.files ? target.files[0] : null;
}

async function submitKyc() {
    loading.value = true;
    try {
        await api.post("/kyc/submit", {
            fullName: fullName.value,
            idNumber: idNumber.value,
            fileName: file.value?.name,
        });
        toast.show("KYC submitted successfully. Await verification.", "success");
    } catch {
        toast.show("Failed to submit KYC.", "error");
        alert("Failed to submit KYC.");
    } finally {
        loading.value = false;
    }
}
</script>
