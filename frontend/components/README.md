# Components

## Shared Components

- `AppSidebar` — Fixed left sidebar with nav links for all 7 modules. Dark green background, active state highlight.
- `TopNav` — Sticky top navigation bar with horizontal module links, notification bell, and user avatar.
- `KpiCard` — Big-number-plus-label tile used for Dashboard ESG scores. Reusable for any score display.
- `EmissionsTrendChart` — 12-month line chart (Recharts) for emissions data. Takes typed data array.
- `DeptRankingChart` — Horizontal progress bars showing department ESG rankings with colored fills.
- `RecentActivity` — Activity feed with icon-typed entries (upload, alert, challenge). Takes typed array.
- `QuickActions` — Card with 3 CTA buttons (Log Carbon Data, Start Challenge, View Reports).
- `InsightBanner` — Purple/lavender alert banner for AI-driven insights or notifications.
- `SubTabs` — Horizontal row of navigation tabs.
- `ActionCard` — Standard card pattern with icon, badge, meta details, and full-width CTA button.
- `CardGrid` — Responsive layout wrapper for displaying multiple cards.

## UI Components (shadcn/ui)

- `Avatar` — User avatar with image and fallback.
- `Badge` — Inline badge/label.
- `Button` — Standard button with variants.
- `Card` — Container card with header/content/footer.
- `Dialog` — Modal dialog.
- `DropdownMenu` — Dropdown menu with items.
- `Input` — Text input field.
- `Separator` — Visual divider.
- `Sheet` — Slide-out panel.
- `Sidebar` — shadcn sidebar primitives (not used directly — we use AppSidebar).
- `Skeleton` — Loading placeholder.
- `Table` — Data table primitives.
- `Tooltip` — Hover tooltip.
