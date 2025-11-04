# Khatabook - Features Development Roadmap

## Overview
This document outlines all planned features and improvements for the Khatabook financial ledger application. These features are organized by priority and implementation timeline.

---

## 1. Reports Page Redesign

### Current Changes Required
- **Remove**: "By Category" section completely
- **Expand**: Summary section to include comprehensive filtering and data analysis

### Summary Section Enhancements

#### Filtering Options
The summary data should be filtered by the following time periods:
- Today
- This Week
- Last 2 Weeks
- This Month
- Last 3 Months
- Last 6 Months
- Yearly
- All Time
- Custom Date Selection (via calendar date picker)

#### Data Fields to Display
- Number of Transactions
- Amount of Transaction
- Total Give (you_give sum)
- Total Take (you_got sum)
- Net Balance
- Other relevant metrics

### Monthly Trends Section

#### Functionality
- Display this month data (or selected month based on filter)
- Show data in graphs or bar charts
- Allow parameter selection for trends:
  - Transaction counts
  - Give/Got breakdown
  - Other parameters

### Contact Balances Section

#### Visualization
- Bar graph showing contact balances
- Display highest amount 4-5 contacts
- Show net give or got value per contact

---

## 2. Settings Page - Real-time Database Saving

### Requirements
- All settings options to be saved immediately to database (not localStorage)
- Backend: Supabase database as primary storage
- Real-time sync across browser sessions
- Persist user preferences permanently

---

## 3. Currency Switching

### Implementation
- Make currency switching functional across the entire app
- Support multiple currency formats and symbols
- Allow users to change currency from Settings page
- Persist currency selection in database
- Update all numeric displays throughout app

---

## 4. Dark Theme Implementation

### Scope
- Implement complete dark mode for entire application
- Dark theme toggle in Settings
- Persistent theme selection in database
- Ensure accessibility and contrast standards
- Apply to all pages and components

---

## 5. Responsive Design Improvements

### Goals
- Enhance mobile responsiveness
- Improve tablet layout and usability
- Optimize for all screen sizes
- Test on common device breakpoints

---

## 6. Language Selection Feature

### Implementation
- Add language selection option in Settings page
- Support multiple languages (specify based on requirements)
- Real-time language switching
- Persist language preference in database
- Apply translations across entire app

---

## 7. Offline Sync Feature (Advanced)

### Functionality

#### Data Logging
- Log all fetched data to browser storage
- Store transactions, contacts, and settings locally
- Cache API responses for offline access

#### Offline Mode
- Allow app usage without internet connection
- Queue transactions and changes locally
- Display offline indicator to user

#### Automatic Synchronization
- When network reconnects, automatically sync all data
- Bi-directional data exchange:
  - Upload pending local changes to Supabase
  - Download updates from Supabase
- Conflict resolution strategy for simultaneous changes
- Progress indicator during sync process

#### Storage Strategy
- Use IndexedDB or localStorage (TBD based on requirements)
- Implement data versioning for sync integrity
- Regular cleanup of old cached data

---

## Implementation Priority

### Phase 1 (High Priority)
1. Reports Page Redesign
2. Real-time Settings Database Saving

### Phase 2 (Medium Priority)
3. Currency Switching
4. Dark Theme Implementation

### Phase 3 (Lower Priority)
5. Responsive Design Improvements
6. Language Selection
7. Offline Sync Feature

---

## Technical Considerations

- Use Supabase for all persistent storage
- Implement proper error handling for sync operations
- Add loading states during data operations
- Ensure security and data privacy
- Test thoroughly before deployment

---

## Notes
- All features should maintain existing transaction and contact management functionality
- Database schema may need updates to support new features
- UI/UX should remain consistent throughout changes
