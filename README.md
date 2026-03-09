# bbuc-notice-board - UCU-BBUC

Official Online Notice Board System (ONBS) for Uganda Christian University - Bishop Barham University College.

## Features

- Real-time notices and announcements
- Role-based access control (Admin, Approver, Creator, Viewer)
- Multi-department support
- Urgent notice highlighting
- Digital Signage mode
- Attachment support
- Inactivity session timeout
- **Progressive Web App (PWA)**: Installable on laptop and mobile for quick shortcut access

## Technologies

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/bentech3/campus-notice-hub.git
   ```

2. Navigate to the project directory:
   ```sh
   cd campus-notice-hub
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## PWA Installation

You can install this application as a standalone app on your devices:

- **Desktop (Chrome/Edge)**: Click the "Install" icon in the address bar.
- **Mobile (iOS/Android)**: Select "Add to Home Screen" from your browser's share or settings menu.
- **Features**: Offline access to cached notices and a branded home screen icon.

## Development

- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run lint`: Runs ESLint for code quality checks
- `npm run test`: Runs unit tests with Vitest

## License

npx tsc --noEmit --project tsconfig.json

© 2026 UCU — Bishop Barham University College. All rights reserved.



