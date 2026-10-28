import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, json } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  console.log('GET zona:', id);
  const zone = catalog.find(item => item.id === id);
  return zone ? json(200, zone) : json(404, { message: 'Espacio no encontrado' });
};