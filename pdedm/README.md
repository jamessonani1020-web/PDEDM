# Planetary Defense & Ephemeris Data Manager (PDEDM) 🚀

Hey! I built this project as part of a coding challenge to create something cool with real-world space data. PDEDM is a live dashboard that pulls data directly from NASA's Near Earth Object Web Service (NeoWs) and JPL Horizons APIs to track asteroids passing near Earth. 

## What it does

The app gives you a comprehensive view of what's happening around our planet:
- **Live Dashboard**: Displays the total number of Near Earth Objects (NEOs), flags potentially hazardous ones, and highlights the fastest and closest approaching asteroids within a selected date range.
- **Velocity Distribution**: Visualizes the approach velocities of asteroids against their approach dates so you can spot outliers (like a massive rock moving at 30km/s).
- **Data Table**: A clean, sortable table of all NEOs passing by, allowing you to quickly scan through distances and velocities.
- **Ephemeris Panel**: By clicking on any asteroid in the table, the app fetches its specific orbital state vectors from NASA's JPL Horizons system.

## The Story Behind Building It

I wanted to build something that felt like a real mission control center, but getting there wasn't exactly a walk in the park. 

The hardest part by far was dealing with the NASA APIs. The NeoWs API is great, but it has a strict rate limit of 1,000 requests per hour. If you're not careful with how you fetch and cache data, you can burn through that limit just by testing your app. I had to implement a custom rate limit tracker that intercepts the `X-RateLimit-Remaining` headers from NASA's response and updates a progress bar in the sidebar so I wouldn't lock myself out during development.

Another huge challenge was the JPL Horizons API. It doesn't return nice, clean JSON. It returns a massive block of plain text designed for scientists in the 1990s! I had to write a custom text parser (`horizons-client.ts`) that reads the raw string line-by-line, finds the `$$SOE` (Start of Ephemeris) marker, and carefully extracts the X, Y, Z coordinates and velocity vectors using regular expressions. Figuring out how to parse that safely without the app crashing was incredibly satisfying once it finally worked.

## How to run it locally

If you want to run this on your own machine:

1. Clone the repo
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. You'll need to create a `.env.local` file with your NASA API key (you can get one for free from api.nasa.gov):
   ```env
   NASA_API_KEY=your_key_here
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack
- Next.js (React)
- Tailwind CSS (for styling the layout)
- Recharts (for the velocity distribution graphs)
- NASA NeoWs & JPL Horizons (for the data)

Thanks for checking out my project! Building this taught me a ton about handling messy third-party APIs and managing complex state in React.
