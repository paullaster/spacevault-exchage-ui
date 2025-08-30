import api from './api';

let appName = import.meta.env.VUE_APP_NAME || "cryptocurrency-platform"; // use VITE_ prefix
appName = appName.split(" ").join("").toLowerCase();

export type UserProfile = {
    id: number;
    email: string;
    role: string;
    kycStatus?: 'pending' | 'approved' | 'rejected';
};

export async function register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password });
    const { access_token, expiresAt, ...user } = res.data;

    // Store token + metadata
    localStorage.setItem(`${appName}_access`, access_token);
    localStorage.setItem(`${appName}_expiresAt`, expiresAt);
    localStorage.setItem(`${appName}_user`, JSON.stringify(user));

    return user as UserProfile;
}

export async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, expiresAt } = res.data;

    localStorage.setItem(`${appName}_access`, access_token);
    localStorage.setItem(`${appName}_expiresAt`, expiresAt);

    // Get fresh user profile
    const me = await getMe();
    localStorage.setItem(`${appName}_user`, JSON.stringify(me));

    return me;
}

export async function getMe(): Promise<UserProfile> {
    const res = await api.get('/auth/me');
    return res.data as UserProfile;
}

export async function refreshAccess() {
    try {
        const res = await api.post('/auth/refresh', {});
        const { access_token, expiresAt } = res.data;

        localStorage.setItem(`${appName}_access`, access_token);
        localStorage.setItem(`${appName}_expiresAt`, expiresAt);

        return access_token;
    } catch (e) {
        // refresh failed → force logout
        logout();
        throw e;
    }
}

export function logout() {
    api.post('/auth/logout').catch(() => { });
    localStorage.removeItem(`${appName}_access`);
    localStorage.removeItem(`${appName}_expiresAt`);
    localStorage.removeItem(`${appName}_user`);
}
