import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/v1';

export interface HealthStatus {
    service: string;
    status: 'up' | 'down';
    details?: any;
    error?: string;
}

export async function fetchHealthAll(): Promise<HealthStatus[]> {
    const { data } = await axios.get<HealthStatus[]>(`${API_BASE}/_health`);
    return data;
}

export async function fetchHealthOne(service: string): Promise<HealthStatus> {
    const { data } = await axios.get<HealthStatus>(`${API_BASE}/_health/${service}`);
    return data;
}
