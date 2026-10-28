import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { isZoneInput, json, readBody } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const input = readBody(event.body);
  if (!isZoneInput(input)) {
    return json(400, { message: 'Se requieren name, capacity positiva y status OPEN o FULL' });
  }
  console.log('POST zona:', input.name);
  return json(201, { id: 'ZONE-NEW', ...input, operation: 'CREATED' });
};