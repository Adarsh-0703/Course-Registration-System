# Course-Registration-System

# Course Registration SPA


Implementing a course registration portal for a B.Tech Computer Science curriculum.


This repo is meant as a functional demo and a starting point for software engineering exercises: architecture, validation logic, testing, CI, and deployment.


## Features


- Course catalog (many CS courses) with credits 1–4.\
- Real-time credit counter and validation rules: **minimum 16 credits, maximum 27 credits**.\
- Popup modal shown when credit validation fails.\
- Add/Remove courses, filter by domain, search courses.\
- Draft persistence via `localStorage`.\
- Export selection as JSON.\


## Software Engineering Focus


This project is designed for demonstrating practical software engineering principles:


1. **Modular design & separation of concerns**
- UI logic (React components) is separated from data (catalog) and validation rules.
- Easy to extract `validation` into a pure module for unit testing.


2. **Deterministic validation logic**
- All critical checks (credit bounds) are done client-side in a pure, testable function.
- Examples include boundary tests for 15, 16, 27, and 28 credits.


3. **State persistence and UX**
- Uses `localStorage` for drafts to allow iterative user workflows without a backend.
- Clear affordances: Save Draft, Export, Submit (simulated). Modal feedback for validation errors.


4. **Testing & QA**
- Suggests unit tests for the validator (Jest), and E2E tests for the main flows (Playwright or Cypress).
- Test cases: add/remove courses, save/load draft, submit with under/over credits, export JSON.


5. **CI/CD**
- A sample GitHub Actions workflow is suggested (in README) to run lint, unit tests, and build on pull requests.
- Deployment: app is static and can be hosted on GitHub Pages, Netlify, or Vercel.


6. **Extensibility**
- Easy to add prereq checks, scheduling conflict logic, or swap `localStorage` for a lightweight server later.


## How to run locally


```bash
# 1. Create project (recommended)
npx create-react-app course-registration-demo
cd course-registration-demo


# 2. Replace src/App.js (or App.jsx) with `src/App.jsx` from this repo
# 3. Copy other files (README.md, styles.css, etc.)


npm install
npm start
