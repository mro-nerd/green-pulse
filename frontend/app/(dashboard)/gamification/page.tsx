import { ActionCard } from "@/components/action-card";
import { CardGrid } from "@/components/card-grid";
import { Recycle, Bike, Zap, Leaf, Users, Flame, Lock, Trophy, TreePine, Coffee, HeartHandshake, Filter } from "lucide-react";
import { mockChallenges, mockBadges, mockLeaderboard, mockRewards, userBalance } from "@/lib/mock-data/gamification";

export default function GamificationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB]">
      <main className="flex-1 p-8">
        {/* Active Challenges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[24px] font-semibold text-[#191C1E] mb-1">Active Challenges</h2>
              <p className="text-[14px] text-[#707A6C]">Participate to earn XP and unlock rewards.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-md bg-white hover:bg-gray-50 text-[14px] font-medium text-[#191C1E]">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          <CardGrid columns={3}>
            {mockChallenges.map((challenge) => (
              <ActionCard
                key={challenge.id}
                icon={
                  challenge.iconType === "recycle" ? <Recycle className="w-5 h-5" /> :
                  challenge.iconType === "bike" ? <Bike className="w-5 h-5" /> :
                  <Zap className="w-5 h-5" />
                }
                iconBgColor={challenge.iconType === "recycle" ? "bg-orange-50" : "bg-orange-50"}
                iconColor="text-[#EA580C]"
                title={challenge.title}
                subtitle={challenge.description}
                badge={{
                  text: challenge.difficulty,
                  variant: challenge.difficulty === "Easy" ? "neutral" : challenge.difficulty === "Medium" ? "warning" : "error"
                }}
                meta={[
                  { label: "REWARD", value: <><span className="text-[#EA580C]">⭐</span> {challenge.rewardXp} XP</>, align: "left" },
                  { label: "DEADLINE", value: challenge.deadline, align: "right" }
                ]}
                actionText={challenge.progressPct ? `In Progress (${challenge.progressPct}%)` : "Join Challenge"}
                actionState={challenge.progressPct ? "in-progress" : "default"}
              />
            ))}
          </CardGrid>
        </div>

        {/* Badge Gallery & Department Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Badge Gallery */}
          <div className="flex flex-col rounded-[1rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[18px] font-semibold text-[#191C1E]">Badge Gallery</h3>
              <button className="text-[13px] font-medium text-[#0D631B] hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-y-8 flex-1 content-start">
              {mockBadges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2 ${badge.locked ? 'border-[#E2E8F0] bg-[#F8F9FB] text-[#BFC9BA]' : 'border-[#0D631B] bg-[#F0FFF1] text-[#0D631B]'}`}>
                    {badge.iconType === "leaf" ? <Leaf className="w-7 h-7" /> :
                     badge.iconType === "users" ? <Users className="w-7 h-7 text-[#005DB7]" /> :
                     badge.iconType === "flame" ? <Flame className="w-7 h-7 text-[#EA580C]" /> :
                     <Lock className="w-7 h-7" />}
                  </div>
                  <span className={`text-[13px] font-medium text-center leading-tight ${badge.locked ? 'text-[#BFC9BA]' : 'text-[#191C1E]'}`}>
                    {badge.name.split(" ").map((w, i) => <div key={i}>{w}</div>)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Leaderboard */}
          <div className="flex flex-col rounded-[1rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="text-[#EA580C]">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#191C1E]">Department Leaderboard</h3>
              </div>
              <select className="border border-[#E2E8F0] rounded-md px-3 py-1.5 text-[13px] font-medium bg-white text-[#191C1E] outline-none hover:border-[#BFC9BA] cursor-pointer">
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="w-full">
              <div className="grid grid-cols-12 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#707A6C] border-b border-[#E2E8F0] pb-3 mb-3">
                <div className="col-span-2">Rank</div>
                <div className="col-span-7">Department</div>
                <div className="col-span-3 text-right">Total XP</div>
              </div>
              {mockLeaderboard.map((entry, idx) => (
                <div key={entry.rank} className={`grid grid-cols-12 text-[13px] items-center py-3 ${idx !== mockLeaderboard.length - 1 ? 'border-b border-[#E2E8F0]' : ''}`}>
                  <div className="col-span-2 font-semibold flex items-center gap-2 text-[#191C1E]">
                    {entry.rank <= 3 && <Trophy className={`w-4 h-4 ${entry.rank === 1 ? 'text-[#F59E0B]' : entry.rank === 2 ? 'text-[#94A3B8]' : 'text-[#D97706]'}`} />}
                    {entry.rank > 3 && <span className="ml-6">{entry.rank}</span>}
                    {entry.rank <= 3 && <span>{entry.rank}</span>}
                  </div>
                  <div className="col-span-7 font-medium text-[#191C1E]">{entry.department}</div>
                  <div className={`col-span-3 text-right font-medium ${entry.rank === 1 ? 'text-[#BA1A1A]' : 'text-[#707A6C]'}`}>
                    {entry.totalXp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards Catalog */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-semibold text-[#191C1E]">Rewards Catalog</h2>
            <div className="px-4 py-1.5 bg-[#FFF0E6] text-[#EA580C] rounded-full text-[14px] font-medium border border-[#FFD8C2]">
              Your Balance: <span className="ml-1">⭐ {userBalance.toLocaleString()} XP</span>
            </div>
          </div>

          <CardGrid columns={4}>
            {mockRewards.map((reward) => (
              <ActionCard
                key={reward.id}
                icon={
                  reward.iconType === "tree" ? <TreePine className="w-10 h-10" /> :
                  reward.iconType === "coffee" ? <Coffee className="w-10 h-10" /> :
                  reward.iconType === "charity" ? <HeartHandshake className="w-10 h-10" /> :
                  <TreePine className="w-10 h-10" />
                }
                iconBgColor="bg-transparent mb-4"
                iconColor={
                  reward.iconType === "tree" ? "text-[#0D631B]" :
                  reward.iconType === "coffee" ? "text-[#005DB7]" :
                  reward.iconType === "charity" ? "text-[#7A2FAA]" :
                  "text-[#0D631B]"
                }
                title={reward.title}
                subtitle={reward.description}
                meta={[
                  { label: "", value: <><span className="text-[#EA580C]">⭐</span> {reward.costXp.toLocaleString()} XP</>, align: "left" },
                  { label: "", value: <span className="text-[11px] font-normal uppercase tracking-wider">{reward.stock === "Unlimited" ? "Unlimited" : `${reward.stock} in stock`}</span>, align: "right" }
                ]}
                actionText={userBalance >= reward.costXp ? "Redeem Reward" : "Insufficient XP"}
                actionState={userBalance >= reward.costXp ? "success" : "disabled"}
              />
            ))}
          </CardGrid>
        </div>
      </main>
    </div>
  );
}
