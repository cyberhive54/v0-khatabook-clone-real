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
- **SWR**: Data fetching and caching layer (used alongside offline hooks)
- **idb**: IndexedDB wrapper for offline storage
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

### Offline-First Sync Engine

**Architecture** (Implemented Nov 4, 2025):
- **IndexedDB Storage**: Complete offline database using `idb` library (`lib/sync/db.ts`)
  - Stores: contacts, transactions, settings, sync queue, sync logs
  - Supports full CRUD operations offline
  - Automatic data persistence and retrieval

**Sync Manager** (`lib/sync/sync-manager.ts`):
- **Auto-sync**: Automatically syncs every 1 minute when online
- **Manual sync**: User-triggered sync via button in header
- **Conflict Resolution**: Last-Write-Wins strategy using timestamps
- **Queue System**: Operations queued when offline, processed when online
- **Auto-retry**: Failed operations retry with exponential backoff (max 3 retries)
- **Network Monitor**: Detects online/offline status changes in real-time

**Offline-First Hooks**:
- `useContactsOffline`: Manages contacts with offline support
- `useTransactionsOffline`: Manages transactions with offline support
- All operations write to IndexedDB first, then sync to Supabase when online

**Sync UI Components**:
- **SyncStatusEnhanced**: Shows sync status (syncing/synced/offline/error) with icons
- **Manual Sync Button**: Allows user to trigger sync on demand
- **Sync Logs Modal**: Detailed debugging logs accessible via eye icon
- **Settings Integration**: Sync information and controls in settings page

**Data Flow**:
1. User performs action → Update IndexedDB immediately
2. If online → Also update Supabase, on error add to queue
3. If offline → Add operation to sync queue
4. When online → Process queue, download latest from Supabase
5. Auto-sync runs every 60 seconds to keep data fresh

**Logging System**:
- All sync operations logged with timestamps
- Success/error/pending status tracking
- Last 100 logs kept for debugging
- Viewable via eye icon in header or settings page

### Notable Architectural Decisions

**Offline-First Design**: Complete offline functionality with IndexedDB as primary storage. App works fully offline with automatic background sync when online.

**Currency Flexibility**: Multi-currency support built in with configurable currency symbols and formatting utilities.

**Dual Transaction Model**: Transactions track both "you_give" and "you_got" amounts separately rather than using positive/negative amounts, providing clearer business context.

**Balance Calculation**: Contact balances are computed on-the-fly from transaction history rather than stored, ensuring consistency but requiring calculation overhead.

**Image Storage Strategy**: Images stored as base64 strings in database - simple but may impact performance at scale. Consider migrating to object storage (Supabase Storage) for production.