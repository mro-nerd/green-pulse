---
name: EcoSphere
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#40493d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#005db7'
  on-secondary: '#ffffff'
  secondary-container: '#64a1ff'
  on-secondary-container: '#003670'
  tertiary: '#7a2faa'
  on-tertiary: '#ffffff'
  tertiary-container: '#954bc5'
  on-tertiary-container: '#fcecff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#f4d9ff'
  tertiary-fixed-dim: '#e4b5ff'
  on-tertiary-fixed: '#2f004b'
  on-tertiary-fixed-variant: '#6a1b9a'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  stat-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  stat-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 260px
  container_padding: 32px
  stack_gap_tight: 8px
  stack_gap_base: 16px
  grid_gutter: 24px
  component_padding_x: 12px
  component_padding_y: 8px
---

## Brand & Style
The design system is engineered for high-stakes enterprise ESG reporting. It adopts a "Functional Minimalist" aesthetic, drawing inspiration from high-density developer tools and modern SaaS platforms. The visual language prioritizes data clarity, structural integrity, and professional rigor.

The interface utilizes a "layered flat" approach: high-contrast typography, subtle monochromatic borders, and intentional use of whitespace to separate complex data sets. The emotional response is one of precision, transparency, and institutional trust.

## Colors
This design system uses a multi-chromatic palette to categorize ESG pillars. 
- **Environmental (Green):** Primary action color and ecological data indicator.
- **Social (Blue):** Human-centric metrics and secondary interactions.
- **Governance (Purple):** Compliance and administrative signaling.
- **Gamification (Orange):** Progress, rewards, and engagement triggers.

The **Status Colors** are strictly reserved for state-based messaging: Green for completion, Gold for items in progress, Red for high-severity issues, and Gray for inactive states. The background is a clean, off-white neutral to allow data cards and charts to stand out without causing eye strain during long sessions.

## Typography
The system relies on **Inter** for its excellent legibility in high-density environments. 
- **KPI Metrics:** Use `stat-lg` and `stat-md` with bold weights and tight letter spacing to emphasize impact.
- **Data Tables:** Use `table-data` (13px) for a balance between information density and readability. 
- **Hierarchy:** Use `label-caps` for metadata descriptors above values to create clear visual scaffolding.
- **Numeric Data:** Always use tabular lining figures (if available in the font) to ensure numbers align vertically in tables.

## Layout & Spacing
The layout follows a structured, dashboard-centric model.
- **Sidebar:** A fixed 260px "Dark Slate" (#1A202C) navigation provides high contrast against the main content area.
- **Grid:** Use a 12-column fluid grid for the main stage. 
- **Density:** Spacing is tight (8px/16px increments) to maximize "above-the-fold" data visibility. 
- **Margins:** Main content containers should have 32px padding on desktop, reducing to 16px on mobile. 
- **Reflow:** On tablet, the sidebar collapses into an icon-only rail (64px) or a hidden drawer to prioritize the data visualization area.

## Elevation & Depth
Depth is created through "Flat Stacking" rather than dramatic shadows.
- **Base Layer:** The light gray background (#F7F8FA).
- **Surface Layer:** White (#FFFFFF) cards with a 1px border (#E2E8F0) and a very subtle shadow (Alpha 4% Black).
- **Interactive Layer:** Elements like dropdowns or modals use a slightly more pronounced shadow to indicate they are floating above the interface.
- **Focus:** No shadows are used for primary structural elements to maintain a clean "Vercel-like" aesthetic.

## Shapes
A consistent 12px (`rounded-lg`) radius is applied to all primary cards and data containers to soften the technical nature of the platform. Smaller components like buttons, input fields, and tags utilize a 6px to 8px radius to maintain a professional, sharp look without being fully "square."

## Components
- **Buttons:** Small (32px height) for high density. Primary buttons use solid fills of the pillar colors; secondary buttons use the "Ghost" style (1px border, no fill).
- **Cards:** White background, 12px radius, 1px border (#E2E8F0). Header areas of cards should have a subtle bottom border.
- **Data Tables:** Row height of 40px. Zebra-striping is discouraged; use subtle hover highlights on rows instead.
- **KPI Widgets:** Large bold numbers followed by a "label-caps" subtitle. Include a small sparkline or trend indicator (up/down arrow) in the top right.
- **Chips/Badges:** Small, low-contrast background with high-contrast text. For example, a "Completed" chip uses a light green tint with dark green text.
- **Input Fields:** 1px #E2E8F0 border, white background. On focus, use a 2px ring of the primary Environmental Green.