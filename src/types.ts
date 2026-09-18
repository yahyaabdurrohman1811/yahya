export type ContainerSize = '20ft' | '40ft' | '45ft';

export type ContainerType = 
  | '20GP' // General Purpose 20'
  | '40GP' // General Purpose 40'
  | '40HC' // High Cube 40'
  | '20RF' // Reefer 20'
  | '40RF' // Reefer 40'
  | 'OPEN TOP'
  | 'FLAT RACK'
  | 'TANK';

export type ContainerStatus = 
  | 'GATE IN'
  | 'YARD STACK'
  | 'LOADING'
  | 'DISCHARGING'
  | 'GATE OUT'
  | 'INSPECTION';

export type CargoCategory = 
  | 'IMPOR'
  | 'EKSPOR'
  | 'TRANSSHIPMENT'
  | 'EMPTY';

export type ShippingLine = 
  | 'Maersk'
  | 'MSC'
  | 'CMA CGM'
  | 'Evergreen'
  | 'ONE'
  | 'Cosco'
  | 'Samudera Indonesia'
  | 'Meratus'
  | 'Temas Line';

export interface Container {
  id?: string;
  containerNumber: string; // e.g. MSKU1234567 (4 letters, 7 digits)
  isoType: ContainerType;
  size: ContainerSize;
  status: ContainerStatus;
  category: CargoCategory;
  shippingLine: ShippingLine | string;
  grossWeight: number; // in kg
  tareWeight: number;  // in kg
  payloadWeight: number; // gross - tare
  sealNumber: string;
  vesselName: string;
  voyageNumber: string;
  consignee: string;
  yardBlock: string; // e.g., 'A', 'B', 'C', 'R', 'H'
  yardBay: string;   // e.g., '01', '03'
  yardRow: string;   // e.g., '01' - '06'
  yardTier: string;  // e.g., '1' - '5'
  isReefer: boolean;
  reeferTemp?: number | null; // in Celsius
  isHazardous: boolean;
  imoClass?: string;
  notes?: string;
  truckPlate?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  updatedBy: string; // Operator email
}

export interface ActivityLog {
  id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'DISPATCH';
  containerNumber: string;
  operator: string;
  details: string;
  timestamp: string;
}

export interface TerminalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'Admin Terminal' | 'Yard Planner' | 'Gate Inspector';
}
