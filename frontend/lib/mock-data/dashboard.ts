export type KpiData = {
  label: string;
  score: number;
  maxScore: number;
  deltaPercent: number;
  trend: "up" | "down" | "flat";
};

export type EmissionsTrendPoint = {
  month: string;
  emissions: number;
};

export type DeptRanking = {
  department: string;
  score: number;
  color: string;
};

export type RecentActivityItem = {
  id: string;
  icon: "upload" | "alert" | "challenge";
  message: string;
  highlight?: string;
  timestamp: string;
};

export const kpiCards: KpiData[] = [
  {
    label: "Environmental",
    score: 82,
    maxScore: 100,
    deltaPercent: 3,
    trend: "up",
  },
  {
    label: "Social",
    score: 91,
    maxScore: 100,
    deltaPercent: 1,
    trend: "up",
  },
  {
    label: "Governance",
    score: 74,
    maxScore: 100,
    deltaPercent: 4,
    trend: "down",
  },
  {
    label: "Overall ESG",
    score: 82,
    maxScore: 100,
    deltaPercent: 0,
    trend: "flat",
  },
];

export const emissionsTrend: EmissionsTrendPoint[] = [
  { month: "Aug", emissions: 420 },
  { month: "Sep", emissions: 380 },
  { month: "Oct", emissions: 450 },
  { month: "Nov", emissions: 410 },
  { month: "Dec", emissions: 390 },
  { month: "Jan", emissions: 430 },
  { month: "Feb", emissions: 460 },
  { month: "Mar", emissions: 440 },
  { month: "Apr", emissions: 400 },
  { month: "May", emissions: 370 },
  { month: "Jun", emissions: 350 },
  { month: "Jul", emissions: 340 },
];

export const deptRankings: DeptRanking[] = [
  { department: "R&D", score: 94, color: "#0D631B" },
  { department: "Operations", score: 88, color: "#005DB7" },
  { department: "Logistics", score: 76, color: "#707A6C" },
  { department: "Manufacturing", score: 62, color: "#7A2FAA" },
];

export const recentActivity: RecentActivityItem[] = [
  {
    id: "1",
    icon: "upload",
    message: "uploaded new Q3 emissions data.",
    highlight: "Sarah Jenkins",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    icon: "alert",
    message: "Compliance flag raised in",
    highlight: "Manufacturing Facility B",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    icon: "challenge",
    message: "completed the 'Zero Waste Week' challenge.",
    highlight: "Logistics Team",
    timestamp: "1 day ago",
  },
];

export const insightBanner = {
  message: "Governance score dropped 4pts",
  detail: "2 compliance issues overdue in Manufacturing.",
  actionLabel: "View Details",
};
