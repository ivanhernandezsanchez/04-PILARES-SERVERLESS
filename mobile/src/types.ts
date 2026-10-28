export type ZoneStatus = 'OPEN' | 'FULL';
export interface Zone {
  id: string;
  name: string;
  capacity: number;
  status: ZoneStatus;
}
export type ZoneInput = Omit<Zone, 'id'>;
 