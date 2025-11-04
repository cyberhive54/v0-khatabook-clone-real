# Khatabook - Financial Ledger Application

## Overview

Khatabook is a financial ledger application for managing business finances, contacts, and transactions. Built with Next.js and React, it provides a comprehensive system for tracking debits, credits, and maintaining customer/supplier relationships. The application focuses on ease of use with features like transaction history, contact management, balance tracking, and financial reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router and React Server Components
- Uses the new App Router paradigm with file-based routing
- Client-side components marked with "use client" directive
- TypeScript for type safety across the application

**UI Component System**: Radix UI + shadcn/ui
- Component library based on Radix UI primitives
- Customizable components in `components/ui/` directory
- Tailwind CSS for styling with CSS variables for theming
- Supports light/dark themes via next-themes

**State Management Strategy**:
- **SWR** for server state management and data fetching
- Custom React hooks pattern for data operations (contacts, transactions, settings)
- Local state with React useState for UI-specific state
- Zustand store defined but appears unused (legacy code in `lib/store.ts`)

**Key Design Patterns**:
- Custom hooks encapsulate all data operations (`hooks/use-*.ts`)
- Separation of concerns: UI components, business logic hooks, and utility functions
- Optimistic updates via SWR's mutate function
- File-based routing following Next.js conventions

### Backend Architecture

**Database**: Supabase (PostgreSQL)
- Real-time database with built-in authentication
- Uses `@supabase/ssr` for server-side operations
- Browser client and server client separation for optimal performance

**Data Models**:
1. **Contacts** - Customer/supplier information with profile pictures, contact details
2. **Transactions** - Financial entries with you_give/you_got amounts, dates, descriptions
3. **Bills** - Attached bill images linked to transactions
4. **Accounts** - Financial accounts (appears defined but may not be fully implemented)
5. **Settings** - Application configuration with user preferences

**API Pattern**:
- No custom API routes; direct Supabase client usage from hooks
- Client-side data fetching with SWR for caching and revalidation
- Server-side client available for potential SSR needs

**Data Flow**:
- Components call custom hooks (e.g., `useContacts()`, `useTransactions()`)
- Hooks use SWR to fetch from Supabase
- Mutations trigger optimistic updates and revalidation
- Settings are debounced and saved to both Supabase and localStorage

### External Dependencies

**Core Services**:
- **Supabase**: Primary database and authentication backend
  - Tables: contacts, transactions, bills, accounts, settings
  - Real-time capabilities available but not actively used
  - Row-level security should be configured in production

**Third-Party Libraries**:
- **SWR**: Data fetching and caching layer
- **Recharts**: Chart library for reports and visualizations
- **date-fns**: Date formatting and manipulation
- **Radix UI**: Accessible component primitives
- **next-themes**: Theme switching functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Vercel Analytics**: Application analytics

**Image Handling**:
- Base64 encoding for profile pictures and bill images
- Stored directly in database as strings
- No external image storage service (potential scalability concern)

**Deployment**:
- **Replit**: Current hosting platform (migrated from Vercel on Nov 4, 2025)
- Development server configured to run on port 5000 with 0.0.0.0 binding
- Environment variables configured in Replit Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Development Tools**:
- TypeScript for type safety
- ESLint for code linting
- npm as package manager (package-lock.json present)
- Development workflow: `npm run dev` on port 5000

### Notable Architectural Decisions

**Offline Capability**: Settings include `offlineMode` and `liveNetworkCheck` flags, suggesting planned offline-first features, though full implementation appears incomplete.

**Currency Flexibility**: Multi-currency support built in with configurable currency symbols and formatting utilities.

**Dual Transaction Model**: Transactions track both "you_give" and "you_got" amounts separately rather than using positive/negative amounts, providing clearer business context.

**Balance Calculation**: Contact balances are computed on-the-fly from transaction history rather than stored, ensuring consistency but requiring calculation overhead.

**Image Storage Strategy**: Images stored as base64 strings in database - simple but may impact performance at scale. Consider migrating to object storage (Supabase Storage) for production.