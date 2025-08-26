import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Kyc from "../pages/Kyc.vue";
import Dashboard from "../pages/Dashboard.vue";
import HealthDashboard from '../pages/Admin/HealthDashboard.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import { getMe } from "../services/auth";
import { useAuth } from "../composables/useAuth";

const routes: Array<RouteRecordRaw> = [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", component: Login },
    { path: "/register", name: "Register", component: Register },
    { path: "/kyc", name: "KYCForm", component: Kyc },
    { path: "/dashboard", name: "Dashboard", component: Dashboard },
    { path: '/admin/health', name: 'HealthDashboard', component: HealthDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            { path: '', redirect: '/admin/health' }, // landing = Health
            { path: 'health', name: 'HealthDashboard', component: HealthDashboard },
            // stubs (fill later)
            { path: 'users', component: () => import('../pages/Admin/Users.vue') },
            { path: 'kyc', component: () => import('../pages/Admin/KycReview.vue') },
            { path: 'ledger', component: () => import('../pages/Admin/Ledger.vue') },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// let user: any = null;

router.beforeEach(async (to, _from, next) => {
    // Allow login/register always
    if (to.name === "Login" || to.name === "Register") return next();

    try {
        const token = localStorage.getItem('access_token');
        const userRaw = localStorage.getItem('user');
        let user = userRaw ? JSON.parse(userRaw) : null;

        if (!user) {
            user = await getMe(); // fetch user from API
        }

        if (!user) {
            return next({ name: "Login" });
        }

        if (user.kycStatus === "not_submitted" && to.name !== "KYCForm") {
            return next({ name: "KYCForm" });
        }

        if (to.meta.requiresAuth && !token) return next({ path: '/login', query: { r: to.fullPath } });
        if (to.meta.requiresAdmin && user?.role !== 'admin') return next({ path: '/dashboard' });

        const { isAuthenticated, isAdmin } = useAuth();

        if (to.meta.requiresAdmin) {
            if (!isAuthenticated.value) {
                return next({ name: "home" });
            }
            if (!isAdmin.value) {
                return next({ name: "home" }); // or a 403 Forbidden page
            }
        }
        return next();
    } catch (err) {
        // if token invalid
        return next({ name: "Login" });
    }
});

export default router;
