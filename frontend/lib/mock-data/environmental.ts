import type { EnvironmentalGoal, EmissionFactor } from "@/lib/types"

export const activeGoals: EnvironmentalGoal[] = [
  {
    id: "9e9a4f66-8806-4b4f-8a0b-117518bc2575",
    department_id: "dept-manufacturing-001",
    name: "Reduce Scope 1 Emissions",
    target_co2: 500,
    current_co2: 320,
    progress_pct: 64,
    deadline: "2024-12-31T23:59:59Z",
    status: "on_track",
  },
  {
    id: "b2d8c3f4-d19e-4e6f-987a-543210fedcba",
    department_id: "dept-facilities-002",
    name: "Zero Waste to Landfill",
    target_co2: 100, // Representing 100% in UI
    current_co2: 85,
    progress_pct: 85,
    deadline: "2025-06-30T23:59:59Z",
    status: "on_track",
  },
  {
    id: "a1c2e3d4-f5a6-4b7c-8d9e-0123456789ab",
    department_id: "dept-logistics-003",
    name: "Fleet Electrification",
    target_co2: 250, // EVs
    current_co2: 50, // EVs
    progress_pct: 20,
    deadline: "2026-12-31T23:59:59Z",
    status: "lagging",
  }
]

export const mockEmissionFactors: EmissionFactor[] = [
  {
    id: "ef-1",
    activity_type: "Natural Gas (Stationary)",
    unit: "kg/m³",
    co2_per_unit: 2.0213,
    source: "DEFRA",
    effective_date: "2023-01-01T00:00:00Z"
  },
  {
    id: "ef-2",
    activity_type: "Electricity (Grid Average)",
    unit: "kg/kWh",
    co2_per_unit: 0.4332,
    source: "EPA eGRID",
    effective_date: "2024-01-01T00:00:00Z"
  },
  {
    id: "ef-3",
    activity_type: "Diesel (Average Bio-blend)",
    unit: "kg/L",
    co2_per_unit: 2.5123,
    source: "IPCC",
    effective_date: "2022-01-01T00:00:00Z"
  },
  {
    id: "ef-4",
    activity_type: "Jet Fuel (Aviation)",
    unit: "kg/L",
    co2_per_unit: 2.5501,
    source: "GHG Protocol",
    effective_date: "2023-01-01T00:00:00Z"
  },
  {
    id: "ef-5",
    activity_type: "Refrigerant (HFC-134a)",
    unit: "GWP/kg",
    co2_per_unit: 1430.0,
    source: "AR5",
    effective_date: "2024-01-01T00:00:00Z"
  },
  {
    id: "ef-6",
    activity_type: "Pulp & Paper Production",
    unit: "kg/kg",
    co2_per_unit: 0.8240,
    source: "CUSTOM: ERP",
    effective_date: "2023-01-01T00:00:00Z"
  }
]

export interface CarbonCreditTransaction {
  id: string
  date: string
  project_type: 'Reforestation' | 'Renewable' | 'Methane Capture'
  project_name: string
  volume: number
  unit_price: number
  total_cost: number
  verification: 'Verra' | 'Gold Standard' | 'Pending'
}

export const mockCarbonTransactions: CarbonCreditTransaction[] = [
  {
    id: "tx-1",
    date: "Oct 24, 2023",
    project_type: "Reforestation",
    project_name: "Amazon Canopy Protection",
    volume: 2500.00,
    unit_price: 28.00,
    total_cost: 70000.00,
    verification: "Verra"
  },
  {
    id: "tx-2",
    date: "Oct 18, 2023",
    project_type: "Renewable",
    project_name: "Gobi Wind Farm III",
    volume: 1200.00,
    unit_price: 19.50,
    total_cost: 23400.00,
    verification: "Gold Standard"
  },
  {
    id: "tx-3",
    date: "Sep 30, 2023",
    project_type: "Methane Capture",
    project_name: "Blue Water Waste Project",
    volume: 500.00,
    unit_price: 32.00,
    total_cost: 16000.00,
    verification: "Pending"
  }
]

