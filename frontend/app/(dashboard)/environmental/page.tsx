"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Leaf, Bell, Plus, Pencil, Trash2, ChevronDown, Search, Info, ListFilter, Loader2 } from "lucide-react"
import { SubTabs } from "@/components/sub-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import type { EnvironmentalGoal, PaginatedResponse } from "@/lib/types"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

function statusBadge(status: string) {
  switch (status) {
    case "ON_TRACK":
      return (
        <span className="inline-flex items-center rounded-md bg-[#CBFFC2] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#005312]">
          On Track
        </span>
      )
    case "AT_RISK":
      return (
        <span className="inline-flex items-center rounded-md bg-[#FFE0B2] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#E65100]">
          At Risk
        </span>
      )
    case "COMPLETED":
      return (
        <span className="inline-flex items-center rounded-md bg-[#E1F0FF] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#005DB7]">
          Completed
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-[#E1E2E4] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">
          Active
        </span>
      )
  }
}

function progressColor(status: string) {
  switch (status) {
    case "ON_TRACK": return "bg-[#0D631B]"
    case "AT_RISK": return "bg-[#E65100]"
    case "COMPLETED": return "bg-[#005DB7]"
    default: return "bg-[#005db7]"
  }
}

export default function EnvironmentalPage() {
  const { data: session } = useSession()
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const pageSize = 20

  useEffect(() => {
    if (!session?.accessToken) return

    const fetchGoals = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<PaginatedResponse<EnvironmentalGoal>>(
          `/environmental/environmental-goals?page=${page}&page_size=${pageSize}`,
          {},
          session.accessToken
        )
        setGoals(data.items)
        setTotal(data.total)
      } catch (err: any) {
        console.error("[EnvironmentalGoals] Fetch error:", err)
        setError(err.detail || "Failed to load goals")
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [session?.accessToken, page])

  const filteredGoals = search
    ? goals.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : goals

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Top Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-[#F7F8FA] px-8">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-[#0D631B]" />
          <h1 className="text-[24px] font-semibold text-[#191C1E]">Environmental Module</h1>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#40493d] hover:bg-[#E2E8F0]">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Sub Tabs */}
      <SubTabs tabs={tabs} activeTabName="Environmental Goals" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <Button className="h-[32px] bg-[#0D631B] hover:bg-[#1b6d24] text-white gap-1.5 px-3">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d]">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#BA1A1A] hover:text-[#BA1A1A] hover:bg-[#ffdad6]/20">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" className="h-[32px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d]">
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C]" />
              <Input
                placeholder="Search goals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-[32px] w-full pl-9 rounded-[6px] border-[#E2E8F0] bg-white focus-visible:ring-[#0D631B]"
              />
            </div>
          </div>

          {/* Data Card */}
          <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
              <h2 className="text-[18px] font-semibold text-[#191C1E]">
                Environmental Goals
                {!loading && <span className="ml-2 text-[13px] font-normal text-[#707A6C]">({total} total)</span>}
              </h2>
              <button className="text-[#707A6C] hover:text-[#191C1E]">
                <ListFilter className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[#0D631B]" />
                <span className="ml-3 text-[14px] text-[#707A6C]">Loading goals...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[14px] font-medium text-[#BA1A1A]">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4 text-[13px]"
                  onClick={() => setPage(page)}
                >
                  Retry
                </Button>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Leaf className="h-10 w-10 text-[#E2E8F0] mb-3" />
                <p className="text-[14px] font-medium text-[#707A6C]">No environmental goals found</p>
                <p className="text-[12px] text-[#707A6C] mt-1">Create your first goal to start tracking progress</p>
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Name</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Department</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Target CO2</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Current CO2</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Progress</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Deadline</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#40493d]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGoals.map((goal) => (
                      <TableRow key={goal.id} className="h-14 border-b-[#E2E8F0] hover:bg-[#F7F8FA]">
                        <TableCell className="text-[13px] font-medium text-[#191C1E]">{goal.name}</TableCell>
                        <TableCell className="text-[13px] text-[#40493d]">
                          {goal.departmentName || "—"}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#40493d]">{goal.targetCo2.toLocaleString()}t</TableCell>
                        <TableCell className="text-[13px] text-[#40493d]">{goal.currentCo2.toLocaleString()}t</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-[#E2E8F0]">
                              <div
                                className={`h-full rounded-full ${progressColor(goal.status)}`}
                                style={{ width: `${Math.min(goal.progressPct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[13px] font-medium text-[#40493d]">{goal.progressPct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#40493d]">{goal.deadline.split('T')[0]}</TableCell>
                        <TableCell>{statusBadge(goal.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination + Info Footer */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F7F8FA] px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#707A6C]">
                  <Info className="h-4 w-4" />
                  <span className="text-[13px] font-medium">Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses</span>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="h-[32px] px-3 border-[#E2E8F0] text-[12px] font-semibold rounded-[6px]"
                  >
                    Prev
                  </Button>
                  <span className="text-[12px] font-semibold text-[#707A6C]">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="h-[32px] px-3 border-[#E2E8F0] text-[12px] font-semibold rounded-[6px]"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
