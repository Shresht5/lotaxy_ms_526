# Lotaxy

Lotaxy is a desktop-based business management suite built with Electron, designed to centralize HR, inventory, and project tracking for small-to-medium enterprises.

## 🧭 At a Glance
- **What it is:** A cross-platform desktop application for internal business operations.
- **What problem it solves:** Eliminates fragmented data silos by providing a unified interface for managing employees, orders, and inventory.
- **Who uses it:** Business administrators and operations managers.
- **Complexity level:** Intermediate.
- **Best way to explore:** Start with `src/main/ipcs.ts` to understand the bridge between the UI and local data, then run `npm start`.

## 💡 Why This Exists
Managing business data—such as attendance, client records, and project status—often requires juggling multiple web-based SaaS tools. This leads to fragmented workflows and data synchronization issues.

Lotaxy provides a local-first alternative, keeping sensitive business data within the user's environment while providing a cohesive UI. By leveraging Electron, it bridges the gap between web-based development (React/TypeScript) and native OS capabilities.

This project serves as a blueprint for developers building internal tools that require persistent local storage and a responsive, desktop-native user experience.

## ✨ Key Features
- **Centralized Data Management** — Unified modules for HR, Inventory, and Orders to ensure data consistency.
- **Role-Based Navigation** — Integrated `SideBar` and `PasswordGate` components to manage access control.
- **Local-First Persistence** — Uses a structured service layer (`src/services/database/`) to interact with local storage, ensuring offline availability.
- **Themed UI** — Implements `ThemeContext` for light/dark mode support, enhancing user accessibility.
- **IPC-Driven Architecture** — Uses Inter-Process Communication (`src/main/ipcs.ts`) to securely bridge the renderer and main processes.

## 🏗️ Core Architecture
- **System Design Pattern**: Electron Multi-Process Architecture (Main process manages system resources; Renderer process handles the UI).
- **Data Flow**: `UI (React Pages)` → `IPC Channels (src/main/ipcs.ts)` → `Database Services (src/services/database/)` → `Local Storage`.
- **Key Abstractions**: 
    - **Service Layer**: Decouples business logic from UI components.
    - **Context Providers**: Manages global state (Theme, Toasts) across the React tree.
- **Boundaries & Seams**: The `preload.ts` script acts as the secure bridge, exposing only necessary APIs to the renderer process.

## 🛠️ Tech Stack
- **Languages & Frameworks:** TypeScript, React, Electron.
- **Build & Tooling:** Vite (bundler), Electron Forge (packaging), ESLint (linting), PostCSS/Tailwind (styling).
- **Infrastructure:** Local filesystem-based storage.
- **External Runtime Requirements:** Node.js (LTS recommended) and an OS-specific build environment (e.g., Windows/macOS/Linux).

## 📦 Critical Dependencies
- `electron` — The foundation of the desktop app; without it, the application cannot run as a native process.
- `react` — The UI library; essential for the component-based architecture of the dashboard.
- `vite` — The build tool; provides the hot-module replacement (HMR) and bundling required for the development loop.
- `tailwindcss` — The utility-first CSS framework; handles all styling and responsive layout logic.

## 🗂️ Project Structure
```text
/src                → Application source code
  /assets           → Static images and icons
  /components       → Reusable UI elements (Sidebar, Titlebar, PasswordGate)
  /main             → Electron main process logic (IPC handlers)
  /page             → View-level components (Dashboard, HR, Inventory, etc.)
  /services         → Data access layer (Database interaction logic)
  /store            → Global state management (Context API)
  /types            → TypeScript interface definitions for business entities
/dist               → Compiled output (generated)
```
*Mental Map: To understand this project, think of it as a modular dashboard where each page acts as a CRUD interface for a specific business domain.*

## 🔍 Where to Start Reading
**For engineers:**
- `src/main/ipcs.ts` — *The core communication hub defining how the UI requests data.*
- `src/services/database/db.ts` — *The entry point for the persistence layer.*
- `src/preload.ts` — *The security boundary between the web-view and the OS.*

**For learners:**
- `src/components/SideBar.tsx` — *A great example of component-based navigation.*
- `src/store/ThemeContext.tsx` — *Shows how to manage global state in React.*
- `src/page/Dashboard.tsx` — *The primary entry point for the user experience.*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install
# Start the application in development mode
npm start
```

### Verify It's Working
Run `npm start`. A window should appear showing the Lotaxy dashboard. If the `PasswordGate` appears, enter the default credentials to access the main view.

## 🤝 How to Contribute
1. **What is welcome?** UI improvements, bug fixes in database services, and adding new business modules.
2. **Lowest-risk folder:** `src/components/` or `src/page/`.
3. **Good PR:** Includes a clear description of the feature/fix and updates any relevant types in `src/types/`.

**Testing & linting:**
```bash
npm run lint
```

## 🐛 Active Good First Issues
None currently open.

## 📚 What You'll Learn
- **Electron IPC Patterns**: How to safely communicate between the UI and the OS.
- **Service-Oriented Architecture**: Organizing code by business domain rather than just UI components.
- **State Management**: Using React Context for global application settings.
- **TypeScript Tooling**: Configuring a robust build pipeline with Vite and ESLint.

## 🤖 Machine-Readable Metadata [AI-READABLE]
```yaml
repo: Shresht5/lotaxy_ms_526
description: "Desktop-based business management suite for HR, inventory, and project tracking."
stars: 0
forks: 0
open_issues: 0
language: "TypeScript"
license: "none"
architecture_pattern: "Electron Multi-Process"
entry_point: "src/main.ts"
external_dependencies_required: true
test_command: "npm run lint"
ci_present: false
```

## 📊 Quick Stats [AI-READABLE]
| Metric | Value |
|--------|-------|
| ⭐ Stars | 0 |
| 🍴 Forks | 0 |
| 🐛 Open Issues & PRs | 0 |
| 💬 Primary Language | TypeScript |
| ⚖️ License | N/A |