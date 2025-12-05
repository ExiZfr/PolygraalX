import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
        config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
    }
    return config;
});

export const login = async () => {
    const response = await api.post('/auth/login');
    return response.data;
};

export const fetchMetrics = async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
};

export const fetchConfig = async () => {
    const response = await api.get('/settings/config');
    return response.data;
};

export const updateConfig = async (moduleName: string, isEnabled: boolean) => {
    const response = await api.post(`/settings/config/${moduleName}`, null, { params: { is_enabled: isEnabled } });
    return response.data;
};

export const fetchMarkets = async (params: any) => {
    const response = await api.get('/radar/markets', { params });
    return response.data;
};

export const toggleFavorite = async (id: number, isFavorite: boolean) => {
    return api.post(`/radar/markets/${id}/favorite`, null, { params: { is_favorite: isFavorite } });
};

export const toggleTrack = async (id: number, isTracked: boolean) => {
    return api.post(`/radar/markets/${id}/track`, null, { params: { is_tracked: isTracked } });
};

export default api;
