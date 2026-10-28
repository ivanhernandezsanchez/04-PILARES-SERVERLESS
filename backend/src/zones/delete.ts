import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, json } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  if (!catalog.some(zone => zone.id === id)) return json(404, { message: 'Espacio no encontrado' });
  console.log('DELETE zona:', id);
  return json(200, { id, operation: 'DELETED' });
};