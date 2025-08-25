import api from './api';

let appName = import.meta.env.VUE_APP_NAME || "Cryptocurrency Platform";
appName = appName.split(" ").join("").toLowerCase();

export type UserProfile = {
    id: number;
    email: string;
    role: string;
    kycStatus?: 'pending' | 'approved' | 'rejected';
};

export async function register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password });
    const { access_token, refresh_token } = res.data;
    localStorage.setItem(`${appName}_access`, access_token);
    if (refresh_token) localStorage.setItem(`${appName}_refresh`, refresh_token);
    // fetch and store basic profile
    const me = await getMe();
    localStorage.setItem(`${appName}_user`, JSON.stringify(me));
    return me;
}

export async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, refresh_token } = res.data;
    localStorage.setItem(`${appName}_access`, access_token);
    if (refresh_token) localStorage.setItem(`${appName}_refresh`, refresh_token);
    const me = await getMe();
    localStorage.setItem(`${appName}_user`, JSON.stringify(me));
    return me;
}

export async function getMe(): Promise<UserProfile> {
    const res = await api.get('/auth/me');
    return res.data as UserProfile;
}

export function logout() {
    api.post('/auth/logout').catch(() => { });
    localStorage.removeItem(`${appName}_access`);
    localStorage.removeItem(`${appName}_refresh`);
    localStorage.removeItem(`${appName}_user`);
}
