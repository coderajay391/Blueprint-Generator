# Blueprint Generator (Beginner Full-Stack Architect)

This project is an educational **full‑stack blueprint generator**. It helps beginners understand how a React frontend and an Express backend connect—by producing a ready-to-read blueprint of:

- A **React** UI (state + `useEffect` + `fetch`)
- An **Express** server (middleware like `express.json()` + REST routes)
- A **database layer concept** (Mongoose schema / validation examples)
- A **learning README** (setup + run instructions)

> Note: The app can run with a **Gemini API key** for live generation, but it also includes a **fully offline fallback** so the experience still works without external API access.

## Preview
<image scr="./dist/assets/blueprint-generator.png"></image>

## Demo
[watch Demo](dist/assets/blueprint-generator.mp4)


---

## What you get

Inside the generator UI, you can:

- Choose a **preset** blueprint (e.g., Todo / Auth)
- Describe your own idea in natural language and generate a blueprint
- View blueprint sections:
  - **Code files** (frontend + backend snippets and explanations)
  - **Request flow** (step-by-step lifecycle)
  - **Database schema** (starter Mongoose schema)
  - **Environment variables guide** (`.env` placeholders + security reminder)
  - **Handbook / README** (copyable markdown instructions)
- Use **beginner checkpoints** (quick quiz) to reinforce key concepts.

---

## Tech stack

- React (UI)
- Vite (dev/build tooling)
- Express (server)
- `@google/genai` (optional Gemini generation)
- TailwindCSS (styling)

---

## Running the project

### 1) Install dependencies

```bash
npm install
```

### 2) (Optional) Add Gemini API key

Create a `.env` file in the project root (if you don’t already have one):

```bash
GEMINI_API_KEY=your_key_here
```

If you skip this, the app uses the built-in fallback blueprint.

### 3) Start the dev server

```bash
npm run dev
```

Open the URL shown in the terminal.

---

## How generation works (high level)

- **Frontend**: lets you pick a preset or submit a custom prompt.
- **Generator engine**:
  - If `GEMINI_API_KEY` exists, the Express server calls Gemini and expects **raw JSON** that matches the blueprint interface.
  - If no key exists (or generation fails), it returns a **fallback** educational blueprint generated from the prompt.
- **Renderer**: displays blueprint content with explanations and copy-to-clipboard actions.

---

## Key concepts highlighted in the blueprints

- React:
  - `useState` for local state
  - `useEffect` for data fetching on mount
  - Immutable updates when appending new records
- Express:
  - `express.json()` for JSON payload parsing
  - REST endpoints (`GET` + `POST`)
  - CORS enabling for local dev
- Database:
  - Mongoose schema design as a validation layer
  - Why `.env` holds secrets (security best practice)

---

## Project structure

- `server.ts`: Express + optional Gemini integration
- `src/App.tsx`: main UI (tabs, preset selection, code viewers)
- `src/data/presets.ts`: predefined blueprint templates
- `src/data/generator.ts`: offline blueprint compiler based on prompt keywords
- `src/components/InteractiveCodeViewer.tsx`: code rendering + annotations

---

## Copying the generated README

Use the **Handbook (README)** tab and click **Copy README**.

You can then paste it into a new folder to follow the blueprint’s step-by-step setup and launch instructions.

---

