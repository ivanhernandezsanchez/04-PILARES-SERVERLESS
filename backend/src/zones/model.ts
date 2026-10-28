import type { APIGatewayProxyResult } from 'aws-lambda';

export type ZoneStatus = 'OPEN' | 'FULL';

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  status: ZoneStatus;
}

export type ZoneInput = Omit<Zone, 'id'>;

export const catalog: Zone[] = [
  { id: 'ZONE-01', name: 'Main Stage', capacity: 5000, status: 'OPEN' },
  { id: 'ZONE-02', name: 'Garden Stage', capacity: 2500, status: 'FULL' },
  { id: 'ZONE-03', name: 'Invernadero', capacity: 1800, status: 'OPEN' },
  { id: 'ZONE-04', name: 'Food Court', capacity: 1200, status: 'OPEN' }
];

export const json = (statusCode: number, value: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(value)
});

export function readBody(text: string | null): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text ?? 'null');
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function isZoneStatus(value: unknown): value is ZoneStatus {
  return value === 'OPEN' || value === 'FULL';
}

export function isZoneInput(value: Record<string, unknown> | null): value is ZoneInput {
  return value !== null &&
    typeof value.name === 'string' && value.name.trim().length > 0 &&
    typeof value.capacity === 'number' && Number.isInteger(value.capacity) && value.capacity > 0 &&
    isZoneStatus(value.status);
}