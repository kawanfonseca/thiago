export interface FuelType {
  id: number;
  anpCode: string;
  name: string;
  icmsRate: number;
}

export interface PmpfValue {
  id: number;
  fuelType: FuelType;
  fuelTypeId: number;
  value: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RefundCalculation {
  fuelType: string;
  period: string;
  quantity: number;
  value: number;
  pmpf: number;
  icmsRate: number;
  refundAmount: number;
} 