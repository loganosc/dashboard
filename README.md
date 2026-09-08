# Garden of Words Dashboard

Garden of Words is a personal academic dashboard for courses, assignments,
grades, notes, exams, and calendar events.

The visual design and starting template are based on the **Garden of Words
template from Daphne**. This project adapts that template into a working
student planner with Canvas calendar syncing, Notion data support, assignment
status tracking, and local event creation.

## Features

- Course overview and individual course pages
- Assignment to-do list with status controls and due dates
- Direct `Open in Canvas` links for Canvas assignments
- Calendar view with Canvas `.ics` events and recurring events
- Add personal calendar events that persist in browser storage
- Notion-backed academic data with mock-data fallback
- Custom Bubblegum and Winkle typography

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a local `.env.local` file. Never commit this file or share its values.

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_STUDENT_NAME=Your Name
CALENDAR_FEED_URL=https://your-canvas-instance.example/feeds/calendars/user.ics
CALENDAR_TIMEZONE=America/New_York
```

The Canvas calendar feed is read-only. It supplies calendar events and
assignment due dates. The Notion integration reads databases shared with the
integration. The expected database names are:

- `Courses`
- `Assignments`
- `Exams`
- `Events`
- `Readings`
- `Notes`
- `Grades`
- `Semesters`

Optional database IDs can be configured in `.env.local`; see `.env.example`.

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## Data and Privacy

Notion credentials and Canvas feed URLs are server-side environment values and
must not be exposed in client-side code or committed to git. Locally created
calendar events are stored in the browser with `localStorage` and are not
written back to Canvas or Notion.
