# 🌿 Carbon Footprint Tracker

A modern, interactive web application built with **Next.js 14** that helps you track, analyze, and reduce your personal carbon footprint across three key categories — **Transportation**, **Food & Diet**, and **Energy Usage**.

---

## 🚀 Features

### 📊 Impact Dashboard (`/`)
- **Real-time stats cards** — Today's Emissions, Logs Today, Total Logs, Weekly Average, and Emission Forecast, displayed in a horizontally scrollable card row.
- **Daily Goal Progress Bar** — Visual progress bar in the header showing how close you are to your daily CO₂ limit, color-coded green → amber → red.
- **Interactive Bar Chart** — Weekly emissions bar chart (Mon–Sun) with clickable bars to filter the log table by day. Toggle between **Total** and **Weekly Trend** (4-week rolling average) chart modes.
- **Pie Chart** — Category breakdown (Transport / Food / Energy) that updates when you click a day on the bar chart.
- **Customizable Daily Limit** — Set your personal daily CO₂ target (kg CO₂e) via a clean modal popup. Persisted to `localStorage`.
- **Smart Alerts** — Inline dismissible alert cards for:
  - Daily Limit Reached (red)
  - Approaching Daily Limit — 80% threshold (amber)
  - High Emissions (>50 kg today) Alert
- **Daily Eco-Tip** — A rotating, dismissible eco-tip card that cycles through 15 curated sustainability quotes & tips based on the day of the year.
- **Log Table** — Sortable and filterable activity log table with:
  - Sort by date, category, or emission amount
  - Filter by category (All / Transport / Food / Energy)
  - Multi-select checkboxes for bulk deletion
  - Per-row delete with undo toast notification (5-second undo window)
- **Export & Share**
  - **Download JSON** — Export selected or all log entries as a `.json` file.
  - **Share Dashboard** — Capture the entire dashboard as a `.png` image with a confetti celebration on success.

---

### 🧾 Carbon Tracker (`/tracker`)
Log your daily activities across three input panels:

| Category | Inputs | Emission Factors |
|---|---|---|
| **Transportation** | Mode (Public Transit / Bicycle / EV / Gasoline Car) + Distance (km) | 0 – 0.2 kg CO₂e per km |
| **Food & Diet** | Meal Type (Vegan / Vegetarian / Chicken-Fish / Beef-Lamb) + Servings | 0.5 – 3.5 kg CO₂e per serving |
| **Energy Usage** | Action (Renewable / Saving Mode / Unplugged / Standard Grid) + Duration (hrs) | 0 – 0.6 kg CO₂e per hour |

- **Impact Insight Panel** — After each log, a contextual tip is displayed explaining the environmental impact of your choice.
- **Recent Activity Feed** — Scrollable list of your logged activities with per-entry delete and dismiss buttons.
- All data is persisted to `localStorage` and shared across all pages via the global **EcoProvider** context.

---

### 🌍 Environmental Insights (`/insight`)

- **Interactive Personal Biosphere** — An animated outdoor scene (sky, ground, sun, plant, tree, flower) that visually reflects your emission levels:
  - **Thriving** (blue sky, green nature) when emissions are within limits.
  - **Arid** (orange haze, dry/wilted plants) when emissions exceed thresholds.
  - Hover over the plant, tree, or flower to see educational tooltips about their role in the ecosystem.
  - Toggle between **Today** and **Weekly Average** view modes for the biosphere health check.

- **Impact Diagnosis Panel** — Summarizes your weekly output (kg CO₂e), daily average, and primary emission source category with a tailored action plan recommendation.

- **Comparative Sustainability Gauge** — Multi-row progress bars comparing your daily average against:
  - UN 1.5°C sustainable target (5.0 kg/day)
  - Global average daily footprint (13.7 kg/day)
  - Your biosphere's dry threshold

- **Eco Commitments / Pledges** — Tabbed pledge cards for Transport, Food, and Energy. Check off personal commitments; progress is saved to `localStorage`.

- **Did You Know? Trivia Carousel** — 4-slide navigable trivia cards covering vampire power drain, diet carbon intensity, aviation vs. transit, and forest carbon absorption.

---

### 🏆 Initiatives & Badges (`/economy`)

- **Community Eco-Initiatives** — Support 4 green initiatives (Plant a Tree, Clean Water, Solar Project, Wind Energy) with a one-click "Support" button. Redeeming the Tree initiative unlocks the *Tree Planter* badge.

- **Badge System** — Earn 6 achievement badges automatically based on your activity:

| Badge | Requirement |
|---|---|
| 🟢 First Step | Log your first eco-action |
| 🔥 Daily Starter | Maintain a 1-day logging streak |
| 🔥 Habit Builder | Maintain a 3-day logging streak |
| 🔥 Eco Champion | Maintain a 7-day logging streak |
| 🛡️ Consistency | Log 10 eco-actions total |
| 🌳 Tree Planter | Redeem the tree planting initiative |

  - Unearned badges display a live progress bar.
  - Earning a new badge triggers a **confetti animation** and a **badge toast popup**.

- **Achievements Timeline** — Chronological timeline of all earned badges with exact earned date and time.

---

### ⚡ Quick Tracker (Global Floating Button)
A persistent floating action button available on every page that opens a quick-log bottom sheet — so you can log an activity without navigating away from your current page.

---

### 🎨 UI & UX Features

- **Dark / Light mode** — Automatic emission-level-based theme effect: page flashes orange when emissions reach a high threshold.
- **Framer Motion animations** — Smooth page transitions, badge pop-ins, alert slide-ins, and biosphere tooltip reveals.
- **Responsive layout** — Optimized for mobile, tablet, and desktop with adaptive grids and a drag-scrollable card row.
- **Auto-scrolling stat cards** — On mobile/tablet, stat cards auto-scroll left-to-right on a 4-second interval, reversing at the end.
- **Undo Delete** — Deleting a log (single or bulk) shows an undo toast for 5 seconds before the deletion is finalized.
- **localStorage persistence** — All logs, settings, badges, pledges, and redeemed rewards are persisted across sessions without a backend.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Framework & routing |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Bar & Pie charts |
| **Lucide React** | Icon library |
| **html-to-image** | Dashboard screenshot export |
| **canvas-confetti** | Celebration effects |
| **Inter** (Google Fonts) | Typography |

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
│   ├── economy/page.tsx    # Initiatives & Badges page
│   ├── layout.tsx          # Root layout with Navbar & EcoProvider
│   └── globals.css         # Global styles & animations
├── components/
│   ├── eco-provider.tsx    # Global state (Context API + localStorage)
│   ├── navbar.tsx          # Navigation bar
│   ├── quick-tracker.tsx   # Floating quick-log widget
│   ├── custom-select.tsx   # Accessible dropdown component
│   ├── animated-background.tsx   # Subtle background animation
│   └── emission-theme-effect.tsx # Emission-triggered page flash
└── public/
    ├── logo.svg
    ├── sun.svg / dry_sun.svg
    ├── tree.svg / dry_tree.svg
    ├── plant.svg / dry_plant.svg
    └── flower.svg / dry_flower.svg
```

---

## 🌱 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
