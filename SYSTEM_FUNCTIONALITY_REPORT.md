# System Functionality Report

## BBUC Online Notice Board System (ONBS)

**Institution:** Uganda Christian University — Bishop Barham University College (UCU-BBUC)
**Project Name:** BBUC Digital Notice Board
**Date:** March 2026
**Version:** 1.0
**Repository:** https://github.com/bentech3/bbuc-notice-board

---

## 1. Introduction

The BBUC Online Notice Board System (ONBS) is a modern, real-time digital communication platform designed to replace the traditional paper-based notice board at Bishop Barham University College. The system provides a centralized hub for publishing, discovering, and managing official notices, announcements, exams, events, and emergency alerts across the entire campus community.

---

## 2. Technology Stack

| Layer              | Technology                                        |
|--------------------|---------------------------------------------------|
| Frontend Framework | React 18 with TypeScript                          |
| Build Tool         | Vite 5                                            |
| Styling            | Tailwind CSS + shadcn/ui component library        |
| Backend / BaaS     | Supabase (Database, Authentication, Storage, RPC) |
| State Management   | TanStack React Query                              |
| Routing            | React Router v6                                   |
| PWA Support        | vite-plugin-pwa (Workbox)                         |
| Icons              | Lucide React                                      |
| Deployment         | Vercel                                            |

---

## 3. User Roles & Access Control

The system implements **Role-Based Access Control (RBAC)** with four distinct roles:

| Role         | Permissions                                                                                     |
|--------------|--------------------------------------------------------------------------------------------------|
| **Viewer**       | View approved notices, search, filter, bookmark, comment, give feedback, set reminders       |
| **Creator**      | All Viewer permissions + create and submit notices for approval                               |
| **Approver**     | All Creator permissions + approve or reject submitted notices                                 |
| **Super Admin**  | Full system access: user management, department management, system settings, maintenance mode |

---

## 4. Core System Features

### 4.1 Authentication & User Management

- **Sign In / Sign Up:** Secure email-based authentication via Supabase Auth.
- **Password Reset:** Users can request a password reset via email.
- **Profile Management:** Users can view their profile details (name, email, department) and upload a profile avatar photo.
- **Admin User Management:** Super Admins can view all registered users, create new user accounts, and assign roles.
- **Inactivity Auto-Logout:** Sessions are automatically terminated after 2 minutes of inactivity, with a 30-second warning dialog before sign-out. This protects shared or public devices.

### 4.2 Dashboard

- **Personalised Greeting:** Displays a time-based greeting message (e.g., "Good Morning") with the user's name.
- **Statistics Overview:** Shows at-a-glance cards for total notices, pending notices, approved notices, and trending notices.
- **Recent Notices Feed:** Lists the most recently published notices with quick access to details.
- **Bookmarked Notices:** Quick access to notices the user has saved for later.
- **Quick Actions:** Shortcut buttons for creating a new notice (for creators/approvers/admins).

### 4.3 Notice Management

- **Create Notices:** Creators can compose notices with a title, content body, category, priority level, department assignment, urgency flag, and expiry date.
- **File Attachments:** Upload supporting documents (PDF, images, etc.) using Supabase Storage with file size validation.
- **Approval Workflow:** Submitted notices enter a review queue. Approvers can approve or reject notices with a reason.
- **Notice Details:** Full-page view with author information, department badge, creation/expiry dates, status indicators, and view count.
- **Edit & Delete:** Creators can edit their own notices; Super Admins can delete any notice.
- **Archive Notices:** Notices can be archived to keep the active board clean.
- **Notice Filtering:** Filter by status (approved, pending, rejected), department, and search by keyword.
- **Notice Sorting:** Sort by date, priority, or relevance.

### 4.4 Notice Reputation Score

Ranks notices based on user engagement metrics using a weighted scoring algorithm:

| Metric      | Weight |
|-------------|--------|
| Views       | ×1     |
| Likes       | ×3     |
| Comments    | ×2     |
| Helpful     | ×2     |
| Complaints  | ×-3    |

High-impact notices are highlighted with reputation badges: **Low**, **Medium**, or **High**.

### 4.5 Smart Digital Signage Profiles

Configurable display profiles for physical screens mounted around campus:

- **Location-Specific Profiles:** Assign profiles to specific buildings or halls (e.g., Library, Main Hall).
- **Layout Options:** Default (Full Screen), Compact, Ticker Strip, and Grid View.
- **Auto-Rotation:** Custom rotation intervals (default 8 seconds) for cycling through active notices.
- **Dedicated Route:** Separate `/signage` page optimised for kiosk and large-screen display.

### 4.6 Read-Status Heatmap for Offices

A specialised admin analytical view showing notice engagement across departments:

- **Visual Matrix:** Notices vs. Departments in a colour-coded grid.
- **Colour Coding:** Heatmap intensity (muted to green) represents the volume of reads from each department.
- **Effectiveness Tracking:** Helps administration identify which announcements reached their intended audience and which departments need follow-up.

### 4.7 Shortcut Link QR Codes

Automatically generated for every approved notice:

- **Direct Access:** Scanned QR codes link directly to the notice detail page with a `?from=qr` tracking parameter.
- **Downloadable:** Can be saved as PNG images for physical distribution — exam cards, posters, registration forms.
- **Scan Notifications:** When a notice is scanned, the system automatically notifies the notice creator and all Super Admins.
- **Scan Tracking:** QR scans are logged for engagement analytics.

### 4.8 Scheduled Reminder Triggers

Allows students to manage their deadlines proactively:

- **"Remind Me" Button:** Users can set reminders for notices with deadlines.
- **Preset Options:** 1 day, 3 days, or 1 week before the deadline.
- **Integrated Notifications:** Reminders are delivered through the in-app notification system.

### 4.9 Anonymous Feedback & Complaint Tags

A safe channel for student sentiment on individual notices:

- **Feedback Tags:** Helpful, Unhelpful, Confusing, Complaint.
- **Anonymous Submission:** Users can provide candid feedback without identification.
- **Admin Monitoring:** Administrators can track negative sentiment patterns to improve communication quality.

### 4.10 Campus-Level Urgency Layer (Global Alert Mode)

An overriding emergency broadcast system managed by Super Admins:

- **Persistent Banner:** A prominent alert bar displayed at the top of all user dashboards with customisable title and message.
- **Signage Override:** Digital signage screens switch to highlight critical emergency information.
- **Ticker Strip:** Scrolling text for extra details on signage displays.
- **Immediate Visibility:** The alert is visible system-wide until manually dismissed by an admin.

### 4.11 Student-Generated Notice Tags

Community-driven categorisation via hashtags:

- **Tag Submission:** Users can add descriptive tags to notices (e.g., #Exam, #ICT, #Sports).
- **Moderated:** Tags are subject to review and approval.
- **Filtering:** Users can filter the notice board by specific tags to find relevant content.

### 4.12 Offline-Friendly PWA Mode

Ensures reliability even with intermittent campus internet connectivity:

- **Installable App:** Users can install the system as a standalone app on desktop (Chrome/Edge) and mobile (iOS/Android).
- **Service Worker Caching:** Notices are cached locally using Workbox with a NetworkFirst strategy.
- **Offline Browsing:** Users can browse and search recently viewed notices even without internet.
- **Custom App Icon & Splash:** Branded icon and title for the home screen shortcut.

### 4.13 Notice-to-Calendar Auto-Sync

One-click integration with personal schedules:

- **ICS Export:** Downloads a standard iCalendar (.ics) file.
- **Compatibility:** Works with Google Calendar, Microsoft Outlook, and Apple Calendar.
- **Automatic Metadata:** Includes notice title, content summary, and a direct link back to the notice.

### 4.14 Comments System

Interactive discussion on individual notices:

- **Threaded Comments:** Users can post comments on any approved notice.
- **Author Attribution:** Comments display the poster's name and avatar.
- **Real-Time Updates:** New comments appear without page refresh via React Query invalidation.

### 4.15 Notice Bookmarks

Personal notice curation:

- **Save for Later:** Users can bookmark any notice for quick future access.
- **Bookmark Dashboard:** A dedicated section on the dashboard lists all bookmarked notices.
- **Toggle:** One-click bookmark/unbookmark with instant UI feedback.

### 4.16 Like System

Community engagement metric:

- **Like Button:** Users can like/unlike individual notices.
- **Like Count:** Displayed on notice cards and detail pages.
- **Reputation Impact:** Likes contribute to the notice reputation score (×3 weight).

### 4.17 Push Notifications

Real-time device notifications:

- **Browser Push:** Users can opt into push notifications from the Settings page.
- **Notification Centre:** In-app notification panel showing all alerts — new notices, approvals, QR scans, and reminders.
- **Read/Unread Tracking:** Notifications are marked as read when viewed.

### 4.18 Department Management

Organisational structure management (Super Admin only):

- **Create / Edit / Delete Departments:** Manage the department hierarchy.
- **Department Subscriptions:** Users can subscribe to departments to receive relevant notices.
- **Department Filtering:** Filter notices by department across the system.

### 4.19 Maintenance Mode

System-wide access control for planned downtime:

- **Toggle Control:** Super Admins can enable/disable maintenance from the Admin System Settings page.
- **Custom Message:** Editable maintenance message displayed to blocked users.
- **Access Restriction:** Only Super Admins can access the system during maintenance; all other roles (Viewers, Creators, Approvers) are blocked immediately after login.
- **Admin Sign-In:** Blocked users see a "Sign In (Admins Only)" button to switch to an admin account, or a "Sign Out" button to leave.
- **Auth Page Access:** The login page remains accessible during maintenance so admins can sign in.

---

## 5. System Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│  React + TypeScript + Vite + Tailwind + shadcn/ui      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │  Pages   │ │Components│ │  Hooks   │ │  Router   │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│  Service Worker (PWA / Workbox)                        │
└────────────────────┬───────────────────────────────────┘
                     │ HTTPS API Calls
┌────────────────────▼───────────────────────────────────┐
│                  SUPABASE (BaaS)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │   Auth   │ │ Database │ │ Storage  │ │   RPC     │ │
│  │(Email/PW)│ │(Postgres)│ │ (Files)  │ │(Functions)│ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│  Row-Level Security (RLS) Policies                     │
└────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                  VERCEL (Hosting)                       │
│  CDN + Edge Network + Auto SSL + Preview Deployments   │
└────────────────────────────────────────────────────────┘
```

---

## 6. Page Structure

| #  | Page                    | Route                | Description                                      |
|----|-------------------------|----------------------|--------------------------------------------------|
| 1  | Landing / Index         | `/`                  | Redirects to Dashboard (if logged in) or Auth    |
| 2  | Authentication          | `/auth`              | Sign In, Sign Up, Forgot Password                |
| 3  | Password Reset          | `/reset-password`    | Reset password via email link                    |
| 4  | Dashboard               | `/dashboard`         | Overview, stats, recent & bookmarked notices     |
| 5  | All Notices             | `/notices`           | Browse, search, and filter all approved notices  |
| 6  | Create Notice           | `/notices/create`    | Compose and submit a new notice                  |
| 7  | Notice Detail           | `/notices/:id`       | Full notice view, comments, QR, feedback, likes  |
| 8  | Approval Queue          | `/approval-queue`    | Review pending notices (Approvers/Admins)        |
| 9  | Digital Signage         | `/signage`           | Full-screen notice display for kiosks            |
| 10 | Settings / Profile      | `/settings`          | Profile, avatar, push notifications, subscriptions|
| 11 | Admin: Users            | `/admin/users`       | Manage users and roles (Super Admin)             |
| 12 | Admin: Departments      | `/admin/departments` | Manage departments (Super Admin)                 |
| 13 | Admin: System Settings  | `/admin/settings`    | Maintenance mode toggle (Super Admin)            |
| 14 | Install                 | `/install`           | PWA installation guide                           |
| 15 | 404 Not Found           | `*`                  | Friendly error page for unknown routes           |

---

## 7. Security Measures

- **Supabase Auth:** Industry-standard email/password authentication with JWT tokens.
- **Row-Level Security (RLS):** PostgreSQL policies ensure users can only access data they are authorised to see.
- **Role-Based Guards:** Frontend route guards and component-level checks enforce role permissions.
- **Session Management:** Persistent sessions with auto-refresh tokens and inactivity timeout protection.
- **Maintenance Lockdown:** System-wide access restriction to Super Admins only during planned maintenance.

---

## 8. Deployment

- **Hosted on Vercel** with automatic deployments triggered by pushes to the `main` branch.
- **Supabase** handles all backend services (database, auth, storage).
- **Production URL:** Deployed and accessible via Vercel's CDN edge network.

---

## 9. Conclusion

The BBUC Online Notice Board System is a fully functional, production-ready web application that modernises campus communication. With 19 distinct features spanning notice management, engagement analytics, emergency alerts, digital signage, offline support, and robust administrative controls, the system provides a comprehensive solution for Bishop Barham University College's communication needs.

---

*Prepared by: Bentech Concepts*
*© 2026 UCU — Bishop Barham University College. All rights reserved.*
