# 🌿 Carbon Footprint Tracker

A modern, interactive web application built with **Next.js 14** that helps you record, analyze, and reduce your personal carbon footprint across three key categories — **Transportation**, **Food & Diet**, and **Energy Usage**.

---

## 🚀 Features

### 📊 Impact Dashboard (`/`)
- **Real-time stats cards** — Footprints Today, Total Footprints, Weekly Average, and Emission Forecast, displayed in a horizontally scrollable card row.
- **Daily Goal Progress Bar** — Visual progress bar in the header showing how close you are to your daily CO₂ limit, color-coded green → amber → red.
- **Interactive Bar Chart** — Weekly emissions bar chart (Mon–Sun) with clickable bars to filter the activity table by day. Toggle between **Total** and **Weekly Trend** (4-week rolling average) chart modes.
- **Pie Chart** — Category breakdown (Transport / Food / Energy) that updates dynamically when you filter by day.
- **Customizable Daily Limit** — Set your personal daily CO₂ target (kg CO₂e) via a clean modal popup. Persisted to `localStorage`.
- **Smart Alerts** — Inline dismissible alert cards for Daily Limit Reached (red), Approaching Daily Limit (80% threshold, amber), and High Emissions Alert.
- **Daily Eco-Tip** — A rotating, dismissible eco-tip card that cycles through 15 curated sustainability quotes & tips based on the day of the year.
- **Footprint Activity Log** — Sortable and filterable activity log table with:
  - Sort by date, category, or emission amount.
  - Filter by category (All / Transport / Food / Energy).
  - Multi-select checkboxes for bulk deletion.
  - Per-row delete with undo toast notification (5-second undo window).
- **Export & Share**
  - **Export JSON** — Export selected or all footprint entries as a `.json` file.
  - **Share Dashboard** — Capture the entire dashboard as a `.png` image with a confetti celebration on success.

---

### 🧾 Carbon Tracker (`/tracker`)
Record your daily activities to track your carbon footprint across three input panels:

| Category | Inputs | Emission Factors | Action Button |
|---|---|---|---|
| **Transportation** | Mode (Public Transit / Bicycle / EV / Gasoline Car) + Distance (km) | 0 – 0.2 kg CO₂e per km | **Record Transport** |
| **Food & Diet** | Meal Type (Vegan / Vegetarian / Chicken-Fish / Beef-Lamb) + Servings | 0.5 – 3.5 kg CO₂e per serving | **Record Meal** |
| **Energy Usage** | Action (Renewable / Saving Mode / Unplugged / Standard Grid) + Duration (hrs) | 0 – 0.6 kg CO₂e per hour | **Record Energy** |

- **Smart Eco-Insights & Recommendations** — A dynamic recommendation engine that triggers multiple value-based, contextual tips (2–5 tips per entry) depending on your selected activity mode and the magnitude of the input value. Includes specific carbon equivalence facts, resource usage statistics, health benefits, and actionable suggestions categorized under custom badges (`Eco-Win`, `Action Item`, `Insight`, and `Alert`).
- **Recent Footprint Records** — Scrollable checklist of logged activities featuring per-row deletion, per-row dismissals, and new global **Dismiss All** and **Delete All** bulk buttons in the section header for quick control.
- All data is persisted to `localStorage` and shared across all pages via the global **EcoProvider** context.

---

### 🌍 Environmental Insights (`/insight`)
- **Interactive Personal Biosphere** — An animated outdoor scene (sky, ground, sun, plant, tree, flower) that visually reflects your emission levels:
  - **Thriving** (blue sky, green nature) when emissions are within limits.
  - **Arid** (orange haze, dry/wilted plants) when emissions exceed thresholds.
  - **Enhanced Visual Prominence** — The center tree asset is expanded (from `w-32` to `w-52` / `max-h-60`) to stand taller and look more visually prominent in your biosphere.
  - Hover over the plant, tree, or flower to see educational tooltips about their role in the ecosystem.
  - **Default Today View** — Tooltip analysis starts at the "Today" tab by default on page load.
- **Impact Diagnosis Panel** — Summarizes your weekly output (kg CO₂e), daily average, and primary emission source category with a tailored action plan recommendation.
- **Comparative Sustainability Gauge** — Multi-row progress bars comparing your daily average against the UN 1.5°C sustainable target (5.0 kg/day) and global average daily footprint (13.7 kg/day).
- **Eco Commitments / Pledges** — Tabbed pledge cards for Transport, Food, and Energy. Check off personal commitments; progress is saved to `localStorage`.
- **Did You Know? Trivia Carousel** — Navigable trivia cards covering vampire power drain, diet carbon intensity, aviation vs. transit, and forest carbon absorption.

---

### 🏆 Achievements & Badges (`/achievement`)
- **Community Eco-Initiatives** — Support 4 green initiatives (Plant a Tree, Clean Water, Solar Project, Wind Energy). Redeeming the Tree initiative unlocks the *Tree Planter* badge.
- **Badge System** — Earn 6 achievement badges automatically based on your activity:

| Badge | Requirement |
|---|---|
| 🟢 First Step | Record your first carbon footprint |
| 🔥 Daily Starter | Maintain a 1-day logging streak |
| 🔥 Habit Builder | Maintain a 3-day logging streak |
| 🔥 Eco Champion | Maintain a 7-day logging streak |
| 🛡️ Consistency | Record 10 carbon footprints total |
| 🌳 Tree Planter | Redeem the tree planting initiative |

- **Achievements Timeline** — Chronological timeline of all earned badges with exact earned date and time.

---

### ⚡ Quick Tracker (Global Floating Button)
A persistent floating action button available on every page that opens a quick-record bottom sheet — so you can record a carbon footprint without navigating away from your current page.

---

### 🔍 Custom 404 Error Page
- A themed custom **404 Not Found Page** (`app/not-found.tsx`) that redirects users who wander off the track.
- Styled with a spinning Compass icon, soft glowing background effects, fade-in animations, structured navigation buttons ("Go Back" and "Return to Dashboard"), and an eco-focused tip card.

---

## 🎨 Dynamic Emission-Responsive Theme & Backgrounds

The application implements a premium, dynamic design system that reflects your real-time carbon footprint:

### 1. Dynamic Background Transitions (`EmissionThemeEffect`)
The page wrapper background color dynamically interpolates based on your daily emissions:
- **Low Emissions (≤ 70 kg CO₂e)**: Crisp light-mode theme with a slate background (`rgb(248, 250, 252)`).
- **Moderate to High Emissions (70 kg to 120 kg CO₂e)**: Dynamically transitions color, shifting step-by-step from light-slate into a deep dark-slate color scheme.
- **Critical Emissions (≥ 120 kg CO₂e)**: Automatically locks into a full slate dark mode (`rgb(15, 23, 36)`).
- **Dynamic Text Coloring**: Tailwind's `dark` class is appended to the root HTML document automatically once emissions pass a 50% threshold, converting text and elements to high-contrast colors on the fly.

### 2. Ambient Floating Background (`AnimatedBackground`)
An animated ambient glow is fixed in the background:
- Renders as a blurred emerald container (`bg-emerald-400/50 blur-[120px]`).
- Gently pulses in scale (`1.0` ↔ `1.1`), shifts positions horizontally/vertically, and breathes in opacity to create a dynamic, biological ambient feeling.

### 3. Responsive Button Overflow Protection
- Dashboard header elements (Limit Settings & Share Dashboard buttons) are optimized to collapse into clean icon-only indicators on mobile and tablet screens (`hidden lg:inline` text labels) to avoid horizontal wrapping or button clipping alongside the goal meter.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Framework & Routing |
| **TypeScript** | Static Type Safety |
| **Tailwind CSS** | Responsive Styling & Layouts |
| **Framer Motion** | Physics-based animations & transitions |
| **Recharts** | Bar & Pie charts |
| **Lucide React** | Icon library |
| **html-to-image** | Dashboard screenshot export |
| **canvas-confetti** | Celebration effects |
| **Inter** (Google Fonts) | Primary Typography |

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Carbon footprint/
├── app/
│   ├── page.tsx            # Dashboard page
│   ├── tracker/page.tsx    # Carbon Tracker page
│   ├── insight/page.tsx    # Environmental Insights page
│   ├── achievement/page.tsx# Achievements & Badges page
│   ├── not-found.tsx       # Custom 404 page
│   ├── layout.tsx          # Root layout with Navbar & EcoProvider
│   └── globals.css         # Global styles & keyframe animations
├── components/
│   ├── eco-provider.tsx    # Global state (Context API + localStorage)
│   ├── navbar.tsx          # Navigation bar
│   ├── quick-tracker.tsx   # Floating quick-record widget
│   ├── custom-select.tsx   # Accessible dropdown component
│   ├── animated-background.tsx   # Ambient background animation
│   └── emission-theme-effect.tsx # Emission-triggered dynamic background transition
└── public/
    ├── logo.svg
    ├── sun.svg / dry_sun.svg
    ├── tree.svg / dry_tree.svg
    ├── plant.svg / dry_plant.svg
    └── flower.svg / dry_flower.svg
```

---

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
