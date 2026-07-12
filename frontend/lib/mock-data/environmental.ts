import type { EnvironmentalGoal, EmissionFactor } from "@/lib/types"

// These are used as FALLBACK data when the API is unreachable.
// In production, all pages fetch from the backend.

export const activeGoals: EnvironmentalGoal[] = [
  {
    id: "9e9a4f66-8806-4b4f-8a0b-117518bc2575",
    departmentId: "dept-manufacturing-001",
    departmentName: "Manufacturing",
    name: "Reduce Scope 1 Emissions",
    targetCo2: 500,
    currentCo2: 320,
    progressPct: 64,
    deadline: "2024-12-31T23:59:59Z",
    status: "ON_TRACK",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "b2d8c3f4-d19e-4e6f-987a-543210fedcba",
    departmentId: "dept-facilities-002",
    departmentName: "Facilities",
    name: "Zero Waste to Landfill",
    targetCo2: 100,
    currentCo2: 85,
    progressPct: 85,
    deadline: "2025-06-30T23:59:59Z",
    status: "ON_TRACK",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "a1c2e3d4-f5a6-4b7c-8d9e-0123456789ab",
    departmentId: "dept-logistics-003",
    departmentName: "Logistics",
    name: "Fleet Electrification",
    targetCo2: 250,
    currentCo2: 50,
    progressPct: 20,
    deadline: "2026-12-31T23:59:59Z",
    status: "AT_RISK",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  }
]

export const mockEmissionFactors: EmissionFactor[] = [
  {
    id: "ef-1",
    activityType: "Natural Gas (Stationary)",
    unit: "kg/m³",
    co2PerUnit: 2.0213,
    source: "DEFRA",
    effectiveDate: "2023-01-01T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "ef-2",
    activityType: "Electricity (Grid Average)",
    unit: "kg/kWh",
    co2PerUnit: 0.4332,
    source: "EPA eGRID",
    effectiveDate: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ef-3",
    activityType: "Diesel (Average Bio-blend)",
    unit: "kg/L",
    co2PerUnit: 2.5123,
    source: "IPCC",
    effectiveDate: "2022-01-01T00:00:00Z",
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2022-01-01T00:00:00Z",
  },
  {
    id: "ef-4",
    activityType: "Jet Fuel (Aviation)",
    unit: "kg/L",
    co2PerUnit: 2.5501,
    source: "GHG Protocol",
    effectiveDate: "2023-01-01T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "ef-5",
    activityType: "Refrigerant (HFC-134a)",
    unit: "GWP/kg",
    co2PerUnit: 1430.0,
    source: "AR5",
    effectiveDate: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ef-6",
    activityType: "Pulp & Paper Production",
    unit: "kg/kg",
    co2PerUnit: 0.8240,
    source: "CUSTOM: ERP",
    effectiveDate: "2023-01-01T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  }
]
