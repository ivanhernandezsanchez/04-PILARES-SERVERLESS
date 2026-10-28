import type { Zone, ZoneInput, ZoneStatus } from './types';

export const API_URL = 'http://localhost:3000/dev';
 
async function request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const response = await fetch(API_URL + path, {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  });
  const value: unknown = await response.json();
  if (!response.ok) {
    const message = typeof value === 'object' && value !== null && 'message' in value
      ? String(value.message) : response.statusText;
    throw new Error('HTTP ' + response.status + ': ' + message);
  }
  return value;
}
 
function isZone(value: unknown): value is Zone {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'capacity' in value && typeof value.capacity === 'number' &&
    'status' in value && (value.status === 'OPEN' || value.status === 'FULL');
}
 
export async function getZones(): Promise<Zone[]> {
  const value = await request('/zones');
  if (!Array.isArray(value) || !value.every(isZone)) throw new Error('La API no devolvió una lista de espacios válida');
  return value;
}
 
export async function getZone(id: string): Promise<Zone> {
  const value = await request('/zones/' + encodeURIComponent(id));
  if (!isZone(value)) throw new Error('La API no devolvió un espacio válido');
  return value;
}

export const createZone = (input: ZoneInput) => request('/zones', 'POST', input);
export const replaceZone = (id: string, input: ZoneInput) => request('/zones/' + encodeURIComponent(id), 'PUT', input);
export const updateZone = (id: string, changes: Partial<ZoneInput>) => request('/zones/' + encodeURIComponent(id), 'PATCH', changes);
export const deleteZone = (id: string) => request('/zones/' + encodeURIComponent(id), 'DELETE');

export const nextZoneStatus = (status: ZoneStatus): ZoneStatus => status === 'OPEN' ? 'FULL' : 'OPEN';
 