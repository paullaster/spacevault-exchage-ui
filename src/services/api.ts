// src/services/api.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VUE_APP_API_BASE || 'http://localhost:3800/api/v1',
    withCredentials: false,
    timeout: 30000
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (val?: any) => void;
    reject: (err: any) => void;
}> = [];

/** helper to process queued requests while refresh is in-flight */
function processQueue(error: any, token: string | null = null) {
    failedQueue.forEach(p => {
        if (error) p.reject(error);
        else p.resolve(token);
    });
    failedQueue = [];
}

let appName = import.meta.env.VUE_APP_NAME || "Cryptocurrency Platform";
appName = appName.split(" ").join("").toLowerCase();
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem(`${appName}_access`);
    if (token) {
        // Ensure headers is always an object
        cfg.headers = {
            ...(cfg.headers || {}),
            Authorization: `Bearer ${token}`
        } as typeof cfg.headers;
    }
    return cfg;
});

/** Response interceptor that handles 401 and does token refresh */
api.interceptors.response.use(
    res => res,
    async (err: AxiosError & { config?: any }) => {
        const originalConfig = err.config;
        if (!originalConfig) return Promise.reject(err);

        if (err.response?.status === 401 && !originalConfig._retry) {
            // mark retry to avoid loops
            originalConfig._retry = true;

            if (isRefreshing) {
                // queue request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalConfig.headers['Authorization'] = `Bearer ${token}`;
                    return axios(originalConfig);
                }).catch(e => Promise.reject(e));
            }

            isRefreshing = true;
            const refreshToken = localStorage.getItem(`${appName}_refresh`);

            if (!refreshToken) {
                isRefreshing = false;
                return Promise.reject(err);
            }

            try {
                const userId = JSON.parse(localStorage.getItem(`${appName}_user`) || 'null')?.id;
                const resp = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    userId,
                    refresh_token: refreshToken
                });
                const { access_token, refresh_token: newRefresh } = resp.data;

                localStorage.setItem(`${appName}_access`, access_token);
                if (newRefresh) localStorage.setItem(`${appName}_refresh`, newRefresh);

                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                processQueue(null, access_token);
                originalConfig.headers['Authorization'] = `Bearer ${access_token}`;
                return axios(originalConfig);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                // cleanup local storage on failed refresh
                localStorage.removeItem(`${appName}_access`);
                localStorage.removeItem(`${appName}_refresh`);
                localStorage.removeItem(`${appName}_user`);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    }
);

export default api;
