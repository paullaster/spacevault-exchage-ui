import api from './api';

export interface HealthStatus {
    service: string;
    status: 'up' | 'down';
    details?: any;
    error?: string;
}

export async function fetchHealthAll(): Promise<HealthStatus[]> {
    const { data } = await api.get<HealthStatus[]>('/_health');
    return data;
}

export async function fetchHealthOne(service: string): Promise<HealthStatus> {
    const { data } = await api.get<HealthStatus>(`_health/${service}`);
    return data;
}
