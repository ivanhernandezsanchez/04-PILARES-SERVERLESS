import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, isZoneStatus, json, readBody } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  if (!catalog.some(zone => zone.id === id)) return json(404, { message: 'Espacio no encontrado' });
  const input = readBody(event.body);
  const keys = input ? Object.keys(input) : [];
  const validKeys = keys.length > 0 && keys.every(key => ['name', 'capacity', 'status'].includes(key));
  const validValues = input !== null &&
    (input.name === undefined || (typeof input.name === 'string' && input.name.trim().length > 0)) &&
    (input.capacity === undefined || (typeof input.capacity === 'number' && Number.isInteger(input.capacity) && input.capacity > 0)) &&
    (input.status === undefined || isZoneStatus(input.status));
  if (!validKeys || !validValues) {
    return json(400, { message: 'PATCH requiere cambios válidos en name, capacity o status OPEN/FULL' });
  }
  console.log('PATCH zona:', id);
  return json(200, { id, changes: input, operation: 'UPDATED' });
};