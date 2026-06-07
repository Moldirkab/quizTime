# quizTime

A modern, full-stack flashcard and quiz application built to streamline studying, tracking progress, and managing deck configurations. The application features an interactive, highly responsive user interface with stylized layouts and smooth animations.

## Live Demo

- **Production Link:** [quiz-time-rho.vercel.app](https://quiz-time-rho.vercel.app/)

---

## Features

- **Dual-Tab Dashboard:** Seamlessly toggle between **Explore Public** decks to browse global categories and **Personal** decks to manage private drafts.
- **Smart Search:** Real-time filtering system to look up global or personal card categories instantly by keyword.
- **Dynamic Subject Hubs:** Dedicated, parameter-driven routes for individual subjects (e.g., Coding, French, World History, Physics, Math) featuring asset tracking.
- **Dynamic Study Views:**
  - **Study Decks:** Interactive flashcard navigation with responsive flipping and tracking.
  - **Quizzes:** Integrated quiz engine displaying question counts, matching themes, and evaluations.
  - **Study Notes:** Organized text-based review modules mapped to specific subject tags.
- **Polished UI/UX:** Built with a "Frosted Glass" aesthetic, custom color palettes for distinct subjects, theme-matching interactive buttons, and micro-interactions (like 3D hover transformations).

---

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript (Strict Mode)
- **Build Tool:** Vite
- **Routing:** React Router v6 (`BrowserRouter` with dynamic routing matching single-page application criteria)
- **Styling:** Tailwind CSS & PostCSS
- **Deployment & CI/CD:** Vercel (Configured with continuous deployment and automatic asset compilation pipelines)

---

## Project Structure Overview

```text
flashcards-app/
├── public/              # Static public assets (Favicon, icons, fallback images)
├── src/
│   ├── assets/          # Subject specific card artwork (coding.png, math.png, etc.)
│   ├── components/      # UI components (DashboardView.tsx, Navigation, etc.)
│   ├── types/           # Global TypeScript interfaces (QuizQuestion, StudyNotes, etc.)
│   ├── App.tsx          # Main entry layout and core dynamic image configurations
│   └── main.tsx         # Virtual DOM mounting point
├── tsconfig.json        # Strict compilation parameters for type-checking safety
├── vite.config.ts       # Core configuration engine for development and building paths
├── vercel.json          # Deployment rewrite layer matching SPA browser refresh routes
└── package.json         # Package dependencies and run scripts
```

---

## Installation & Local Development

Follow these steps to run the project locally on your machine:

Clone the repository:

```bash
git clone [https://github.com/Moldirkab/quizTime.git](https://github.com/Moldirkab/quizTime.git)
```

```bash
cd flashcards-app
```

Install dependencies:

```bash
npm install
```

---

## Configure Environment Variables:

Create a .env or .env.local file in the root directory and add your application variables:
VITE_CLERK_PUBLISHABLE_KEY=your_key_here

## Run the development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser to view the application.

---

## Production Build & Deployment

### Manual Compilation

To compile the application code into optimized static files for production, execute:

```bash
npm run build
```

The output will compile directly into the /dist directory.

### Continuous Deployment with Vercel

The app is fully integrated with Vercel's CI/CD infrastructure. Pushing updates to the main branch will automatically spin up a verification build.

The deployment configuration features a dedicated configuration mapping layer (vercel.json) to accommodate client-side history navigation seamlessly:

```JSON
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This forces Vercel's edge network to route all deep links (e.g., /subject/coding) directly back to the root shell, preventing structural 404 Not Found path errors upon a manual page refresh.
