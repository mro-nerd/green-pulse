export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  deadline: string;
  status: "Draft" | "Active" | "Under Review" | "Completed" | "Archived";
  difficulty: "Easy" | "Medium" | "Hard";
  iconType: "recycle" | "bike" | "lightning";
  progressPct?: number; // if user has joined
}

export interface Badge {
  id: string;
  name: string;
  locked: boolean;
  iconType: "leaf" | "users" | "flame" | "lock";
}

export interface LeaderboardEntry {
  rank: number;
  department: string;
  totalXp: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  costXp: number;
  stock: number | "Unlimited";
  iconType: "tree" | "coffee" | "charity" | "pine";
}

export const mockChallenges: Challenge[] = [
  {
    id: "c1",
    title: "Zero-Waste Week",
    description: "Log all recyclable waste and reduce office paper usage by 50%.",
    rewardXp: 500,
    deadline: "Oct 15",
    status: "Active",
    difficulty: "Medium",
    iconType: "recycle",
  },
  {
    id: "c2",
    title: "Bike to Work",
    description: "Commute via bicycle for 3 days this week to reduce Scope 3 emissions.",
    rewardXp: 250,
    deadline: "Oct 12",
    status: "Active",
    difficulty: "Easy",
    iconType: "bike",
    progressPct: 66,
  },
  {
    id: "c3",
    title: "Energy Vampire Hunt",
    description: "Identify and unplug 10 idle electronic devices in your department.",
    rewardXp: 1000,
    deadline: "Oct 20",
    status: "Active",
    difficulty: "Hard",
    iconType: "lightning",
  },
];

export const mockBadges: Badge[] = [
  { id: "b1", name: "Eco-Warrior", locked: false, iconType: "leaf" },
  { id: "b2", name: "Social Star", locked: false, iconType: "users" },
  { id: "b3", name: "Hot Streak", locked: false, iconType: "flame" },
  { id: "b4", name: "Carbon Neutral", locked: true, iconType: "lock" },
  { id: "b5", name: "Governance Pro", locked: true, iconType: "lock" },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, department: "Engineering", totalXp: 12450 },
  { rank: 2, department: "Marketing", totalXp: 11200 },
  { rank: 3, department: "Human Resources", totalXp: 9850 },
  { rank: 4, department: "Finance", totalXp: 8100 },
  { rank: 5, department: "Operations", totalXp: 7500 },
];

export const mockRewards: Reward[] = [
  {
    id: "r1",
    title: "Carbon Offset Credit",
    description: "Offset 1 ton of CO2 emissions under your name.",
    costXp: 5000,
    stock: "Unlimited",
    iconType: "tree",
  },
  {
    id: "r2",
    title: "Reusable Coffee Cup",
    description: "Premium branded stainless steel travel mug.",
    costXp: 2500,
    stock: 12,
    iconType: "coffee",
  },
  {
    id: "r3",
    title: "$50 Charity Donation",
    description: "Donate to a verified environmental NGO of your choice.",
    costXp: 4000,
    stock: "Unlimited",
    iconType: "charity",
  },
  {
    id: "r4",
    title: "Tree Planting",
    description: "Fund the planting of 5 trees in deforested regions.",
    costXp: 1000,
    stock: "Unlimited",
    iconType: "pine",
  },
];

export const userBalance = 4250;
