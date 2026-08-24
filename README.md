# PDEDM — Planetary Defense & Ephemeris Data Manager

A real-time, full-stack dashboard that connects directly to NASA's Near Earth Object Web Service (NeoWs) and the JPL Horizons system to track every asteroid passing by Earth.

## What It Does

- **Live Asteroid Tracking** — Pulls real-time orbital data from NASA's servers for every near-Earth object within a 7-day forecast window.
- **NEO Operations Dashboard** — Displays raw scientific metrics like relative velocity, miss distance (in Lunar units), estimated diameter, and orbital parameters through sortable tables and velocity distribution charts.
- **Public Briefing Portal** — Translates complex NASA data into real-world analogies that anyone can understand (e.g., "the size of a football stadium" or "30x faster than a bullet"). Uses a simple Condition Green/Yellow threat system.
- **Ephemeris Calculator** — Interactive panel for computing precise orbital parameters using JPL Horizons data.
- **Global Timezone Support** — Converts all event timestamps to any timezone in the world.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom Glassmorphism design system
- **State Management:** Zustand + TanStack React Query
- **Data Source:** NASA NeoWs API + JPL Horizons
- **Charts:** Recharts

## Getting Started

1. Clone this repository
2. Run `npm install`
3. Create a `.env.local` file and add your NASA API key:
   ```
   NASA_API_KEY=your_key_here
   ```
   Get a free key at [https://api.nasa.gov](https://api.nasa.gov)
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/neo/          # Secure backend proxy for NASA API
│   ├── dashboard/        # Main NEO operations dashboard
│   ├── briefing/         # Public-facing briefing portal
│   ├── ephemeris/        # Ephemeris data viewer
│   └── settings/         # API quota and preferences
├── components/
│   ├── animations/       # Saturn loading screen
│   ├── charts/           # Velocity distribution chart
│   ├── layout/           # Sidebar and Footer
│   ├── panels/           # Ephemeris side panel
│   └── table/            # Data table with sorting
├── hooks/                # React Query data hooks
├── lib/api/              # NASA client with error handling
├── stores/               # Zustand state stores
└── types/                # TypeScript schemas
```

## Built By

**James Sonani** — Class 11 PCM, Vidyadhish-Vidyasankul, Bhavnagar, Gujarat, India
