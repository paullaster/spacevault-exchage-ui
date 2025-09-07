<template>
    <div class="min-h-screen flex flex-col">
        <!-- Header/Navigation -->
        <header class="sticky top-0 z-50 bg-white shadow-md">
            <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
                <div class="flex items-center space-x-10">
                    <a href="#" class="text-2xl font-bold text-primary">{{ appName }}</a>
                    <div class="hidden md:flex space-x-8">
                        <a href="#" class="nav-link text-secondary font-medium">Started</a>
                        <a href="#" class="nav-link text-secondary font-medium">Trade</a>
                        <a href="#" class="nav-link text-secondary font-medium">Crypto Currency</a>
                        <a href="#" class="nav-link text-secondary font-medium">About</a>
                        <a href="#" class="nav-link text-secondary font-medium">Contact</a>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="relative hidden md:block">
                        <select
                            class="bg-gray-100 rounded-lg py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                            <option>English</option>
                            <!-- <option>Spanish</option>
                            <option>French</option> -->
                        </select>
                        <i class="fas fa-globe absolute left-3 top-3 text-gray-500 text-xs"></i>
                    </div>
                    <button
                        class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-secondary transition duration-300"
                        @click="router.push({ name: 'Login' })">
                        Login
                    </button>
                    <button
                        class="bg-blue-700 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition duration-300"
                        @click="router.push({ name: 'Register' })">
                        Sign up
                    </button>
                    <button class="md:hidden text-gray-600">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </nav>
        </header>

        <!-- Hero Section -->
        <section class="gradient-bg text-white py-16 md:py-24">
            <div class="container mx-auto px-4 flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 mb-10 md:mb-0">
                    <h1 class="text-4xl md:text-5xl font-bold mb-6">Trade Your Crypto on {{ appName }} with Confidence
                    </h1>
                    <p class="text-xl mb-8 opacity-90">Sign up to get 50 <strong>USDT</strong> For Welcome Bonus</p>
                    <button
                        class="bg-accent hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                        @click="router.push({ name: 'Register' })">
                        Sign Up
                    </button>
                </div>
                <div class="md:w-1/2 grid grid-cols-2 gap-4">
                    <div v-for="crypto in heroCryptos" :key="crypto.symbol"
                        class="bg-black bg-opacity-10 p-4 rounded-xl">
                        <div class="flex items-center mb-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                                :class="crypto.color">
                                <i :class="crypto.icon"></i>
                            </div>
                            <span class="font-semibold">{{ crypto.symbol }}</span>
                        </div>
                        <p class="text-2xl font-bold">{{ crypto.price }}</p>
                        <p :class="crypto.change.includes('+') ? 'text-green-400' : 'text-gray-400'">{{ crypto.change }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Trading Pairs Section -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12 text-secondary">Popular Trading Pairs</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="pair in tradingPairs" :key="pair.name"
                        class="bg-gray-50 rounded-xl p-5 card-hover border border-gray-100">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-secondary">{{ pair.name }}</h3>
                            <button class="bg-primary text-white text-xs px-3 py-1 rounded-lg">E-Trade</button>
                        </div>
                        <p class="text-2xl font-bold mb-2">{{ pair.price }}</p>
                        <div class="flex justify-between text-sm text-gray-500 mb-2">
                            <span>24h Change: <span
                                    :class="pair.change24h.includes('+') ? 'text-green-500' : 'text-red-500'">{{
                                        pair.change24h }}</span></span>
                            <span>Vol: {{ pair.volume }}</span>
                        </div>
                        <div class="h-1 bg-gray-200 rounded-full mb-3">
                            <div class="h-1 rounded-full"
                                :class="pair.change24h.includes('+') ? 'bg-green-500 w-3/4' : 'bg-red-500 w-1/4'"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Vinance Section -->
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-4 text-secondary">Why {{ appName }}?</h2>
                <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">Discover the advantages of trading on our
                    secure and user-friendly platform</p>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="feature in features" :key="feature.title"
                        class="bg-white p-6 rounded-xl shadow-sm card-hover text-center">
                        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                            :class="feature.bgColor">
                            <i :class="feature.icon" class="text-2xl text-primary"></i>
                        </div>
                        <h3 class="font-bold text-lg mb-3">{{ feature.title }}</h3>
                        <p class="text-gray-600">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- How to Invest Section -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-1/2 mb-10 md:mb-0">
                        <h2 class="text-3xl font-bold mb-6 text-secondary">How to Invest?</h2>
                        <p class="text-lg text-gray-600 mb-8">Start trading to get up to $500 in Mystery Box prizes!</p>

                        <div class="flex mb-8">
                            <div
                                class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mr-4">
                                1
                            </div>
                            <div>
                                <h3 class="font-bold text-lg mb-2">Sign Up On {{ appName }}</h3>
                                <p class="text-gray-600">Sign up to get the Welcome Bonus</p>
                            </div>
                        </div>

                        <div class="flex">
                            <div
                                class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mr-4">
                                2
                            </div>
                            <div>
                                <h3 class="font-bold text-lg mb-2">Verified Your Account</h3>
                                <p class="text-gray-600">Verified Account - Full Functionality</p>
                            </div>
                        </div>
                    </div>

                    <div class="md:w-1/2 flex justify-center">
                        <div class="bg-blue-800 rounded-2xl p-8 text-white max-w-md">
                            <h3 class="font-bold text-2xl mb-4">Verified Your Account</h3>
                            <p class="mb-6">Verified Account - Full Functionality</p>

                            <div class="mb-6">
                                <h4 class="font-bold text-lg mb-2">Deposit / Buy Crypto</h4>
                                <p class="text-blue-100">Fund your cryptocurrency account to begin trading. A wide
                                    variety of payment methods are supported.</p>
                            </div>

                            <div class="mb-6">
                                <h4 class="font-bold text-lg mb-2">Trade</h4>
                                <p class="text-blue-100">Start buying and selling cryptocurrencies, and explore our
                                    wonderful services!</p>
                            </div>

                            <button
                                class="bg-accent hover:bg-amber-500 w-full py-3 rounded-lg font-bold transition duration-300"
                                @click="router.push({ name: 'Register' })">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Crypto Market Section -->
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-4 text-secondary">Crypto Currency Market</h2>
                <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">Check some of the most traded Cryptos in
                    {{ appName }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="crypto in cryptocurrencies" :key="crypto.symbol"
                        class="bg-white p-5 rounded-xl shadow-sm card-hover">
                        <div class="flex items-center mb-3">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                :class="crypto.color">
                                <i :class="crypto.icon" class="text-white"></i>
                            </div>
                            <div>
                                <h3 class="font-bold">{{ crypto.symbol }}</h3>
                                <p class="text-sm text-gray-500">{{ crypto.name }}</p>
                            </div>
                        </div>
                        <p class="text-xl font-bold mb-1">{{ crypto.price }}</p>
                        <p :class="crypto.change.includes('+') ? 'text-green-500' : 'text-red-500'">{{ crypto.change }}
                        </p>
                    </div>
                </div>

                <!-- <div class="text-center mt-12">
                    <button
                        class="bg-primary text-black px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
                        What else? <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div> -->
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-dark text-white py-12">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 class="text-2xl font-bold mb-4">VINANCE</h3>
                        <p class="text-gray-400">We're passionate about creating unforgettable moments. Our platform
                            provides a seamless and transparent trading experience.</p>
                    </div>

                    <div>
                        <h4 class="font-bold text-lg mb-4">Quick Links</h4>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Trade</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Market</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Crypto Currency</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-bold text-lg mb-4">Company</h4>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Home</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">About</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-bold text-lg mb-4">Legal</h4>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Trade Policy</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Terms of Use</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Define interfaces for type safety
interface HeroCrypto {
    symbol: string;
    price: string;
    change: string;
    icon: string;
    color: string;
}

interface TradingPair {
    name: string;
    price: string;
    change24h: string;
    volume: string;
}

interface CryptoCurrency {
    symbol: string;
    name: string;
    price: string;
    change: string;
    icon: string;
    color: string;
}

interface Feature {
    title: string;
    description: string;
    icon: string;
    bgColor: string;
}

const appName = import.meta.env.VUE_APP_NAME || "Space Vault";

const router = useRouter();

// Hero section cryptos
const heroCryptos = ref<HeroCrypto[]>([
    {
        symbol: 'BTC',
        price: '21,626.83 $',
        change: '+5.64%',
        icon: 'fab fa-bitcoin',
        color: 'bg-yellow-500'
    },
    {
        symbol: 'ETH',
        price: '1,626.83 $',
        change: '+2.84%',
        icon: 'fab fa-ethereum',
        color: 'bg-purple-500'
    },
    {
        symbol: 'USDT',
        price: '1.00 $',
        change: '0.00%',
        icon: 'fas fa-dollar-sign',
        color: 'bg-blue-500'
    },
    {
        symbol: 'XRP',
        price: '0.341 $',
        change: '+2.68%',
        icon: 'fas fa-chart-line',
        color: 'bg-red-500'
    }
]);

// Trading pairs data
const tradingPairs = ref<TradingPair[]>([
    {
        name: 'BTC_USDT',
        price: '48,883.8977',
        change24h: '+0.32%',
        volume: '1.56B'
    },
    {
        name: 'ETH_BTC',
        price: '0.0397',
        change24h: '+0.02%',
        volume: '4.25M'
    },
    {
        name: 'BTC_ETH',
        price: '27.9703',
        change24h: '+0.16%',
        volume: '553.22K'
    },
    {
        name: 'BTC_EUR',
        price: '43,964.1045',
        change24h: '+0.18%',
        volume: '1.54B'
    }
]);

// Features data
const features = ref<Feature[]>([
    {
        title: '24/7 Customer Service',
        description: `Contact ${appName} customer support with your questions at any time.`,
        icon: 'fas fa-headset',
        bgColor: 'bg-blue-100'
    },
    {
        title: 'Prime Membership',
        description: 'We offer Prime Membership with our dedicated trading expert.',
        icon: 'fas fa-crown',
        bgColor: 'bg-purple-100'
    },
    {
        title: `${appName} Community`,
        description: `There is an excellent team behind ${appName}, and we adore communicating with our users!`,
        icon: 'fas fa-users',
        bgColor: 'bg-amber-100'
    },
    {
        title: `${appName} Academy`,
        description: `Contact ${appName} customer support with your questions at any time.`,
        icon: 'fas fa-graduation-cap',
        bgColor: 'bg-green-100'
    }
]);

// Cryptocurrencies data
const cryptocurrencies = ref<CryptoCurrency[]>([
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: '€62,964.1245',
        change: '-0.16%',
        icon: 'fab fa-bitcoin',
        color: 'bg-yellow-500'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        price: '€2,259.2162',
        change: '-0.08%',
        icon: 'fab fa-ethereum',
        color: 'bg-purple-500'
    },
    {
        symbol: 'USDT',
        name: 'Tether USD+',
        price: '€0.9183',
        change: '-0.01%',
        icon: 'fas fa-dollar-sign',
        color: 'bg-green-500'
    },
    {
        symbol: 'BNB',
        name: 'BNB',
        price: '€513.1911',
        change: '-0.04%',
        icon: 'fas fa-chart-line',
        color: 'bg-amber-500'
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        price: '€140.5245',
        change: '-0.31%',
        icon: 'fas fa-sun',
        color: 'bg-purple-400'
    },
    {
        symbol: 'USDC',
        name: 'USDC',
        price: '€0.9105',
        change: '-0.00%',
        icon: 'fas fa-dollar-sign',
        color: 'bg-blue-500'
    },
    {
        symbol: 'XRP',
        name: 'XRP',
        price: '€0.4708',
        change: '-0.15%',
        icon: 'fas fa-exchange-alt',
        color: 'bg-gray-500'
    },
    {
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: '€0.1427',
        change: '-1.98%',
        icon: 'fas fa-dog',
        color: 'bg-yellow-400'
    }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', sans-serif;
    scroll-behavior: smooth;
}

.gradient-bg {
    background: linear-gradient(135deg, #1652f0 0%, #1e293b 100%);
}

.card-hover {
    transition: all 0.3s ease;
}

.card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.nav-link {
    position: relative;
}

.nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: #1652f0;
    transition: width 0.3s ease;
}

.nav-link:hover::after {
    width: 100%;
}
</style>