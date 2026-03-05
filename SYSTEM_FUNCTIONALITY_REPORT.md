# System Functionality Report: BBUC Online Notice Board System

## Overview
The BBUC Online Notice Board System (ONBS) is a modern, real-time communication platform for Uganda Christian University – Bishop Barham University College. It replaces traditional paper boards with a dynamic, digital ecosystem.

## Core Features

### 1. Notice Reputation Score
Ranks notices based on user engagement metrics:
- **Views**: 1x weight
- **Likes**: 3x weight
- **Comments**: 2x weight
- **Helpful Feedback**: 2x weight
- **Complaints**: -3x weight penalty
High-impact notices are highlighted with reputation badges (Low, Medium, High).

### 2. Smart Digital Signage Profiles
Configurable profiles for physical display screens:
- **Location-Specific**: Profiles can be assigned to specific buildings or halls.
- **Layout Options**: Default (Full Screen), Compact, Ticker Strip, and Grid View.
- **Rotation rules**: Custom intervals (default 8s) for cycling through notices.

### 3. Read‑Status Heatmap for Offices
A specialized admin view showing engagement across the campus:
- **Visual Matrix**: Notices vs. Departments.
- **Color-Coding**: Heatmap colors (Muted to Success Green) represent the volume of reads from each department.
- **Effectiveness Tracking**: Helps offices identify which announcements are reaching the intended audience.

### 4. Shortcut Link QR Codes
Automatically generated for every approved notice:
- **Direct Access**: Links directly to the notice detail page.
- **Versatile**: Can be downloaded as PNG for use on exam cards, physical posters, or registration forms.

### 5. Scheduled Reminder Triggers
Allows students to manage their deadlines:
- **Subscription**: Students can set "Remind Me" triggers for notices with deadlines.
- **Presets**: 1 day, 3 days, or 1 week before the deadline.
- **Notifications**: Integrated with the system's notification layer.

### 6. Anonymous Feedback & Complaint Tags
A safe channel for student sentiment:
- **Tags**: Helpful, Unhelpful, Confusing, Complaint.
- **Monitoring**: Admins can track negative sentiment to refine communication.

### 7. Campus‑Level Urgency Layer (Global Alert Mode)
An overriding emergency system managed by Super Admins:
- **Persistent Banner**: Displays at the top of all user dashboards.
- **Signage Override**: Digital screens switch to highlight critical emergency information.
- **Ticker Strip**: Scrolling text for extra details.

### 8. Student‑Generated Notice Tags
Community-driven categorization:
- **Moderation**: Students can submit tags (e.g., #Exam, #ICT).
- **Filtering**: Allows users to filter notices by specific interests or topics.

### 9. Offline‑Friendly PWA Mode
Ensures reliability even with intermittent connectivity:
- **Caching**: Notices are cached locally using Workbox (NetworkFirst strategy).
- **Searchable**: Students can browse and search recently viewed notices offline.

### 10. Notice‑to‑Calendar Auto‑Sync
One-click integration with personal schedules:
- **ICS Export**: Downloads an iCalendar file compatible with Google Calendar, Outlook, and Apple Calendar.
- **Automatic Metadata**: Includes title, content, and direct link.

## Technology Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Supabase (Database, Auth, Storage, Real-time).
- **State Management**: TanStack Query (React Query).
- **PWA**: vite-plugin-pwa.
- **Icons**: Lucide React.
