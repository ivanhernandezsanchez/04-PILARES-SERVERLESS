import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, isZoneInput, json, readBody } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  if (!catalog.some(zone => zone.id === id)) return json(404, { message: 'Espacio no encontrado' });
  const input = readBody(event.body);
  if (!isZoneInput(input)) {
    return json(400, { message: 'PUT requiere name, capacity positiva y status OPEN o FULL' });
  }
  console.log('PUT zona:', id);
  return json(200, { id, ...input, operation: 'REPLACED' });
};