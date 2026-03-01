# CLAUDE.md — General Project Conventions

This file defines the conventions, architecture principles and tooling choices that apply
to all projects in this workspace. Follow these rules by default unless a project-specific
README explicitly overrides them.

---

## Tech Stack

| Layer      | Choice                                  | Notes                                     |
|------------|-----------------------------------------|-------------------------------------------|
| Framework  | Next.js (App Router)                    | No Pages Router                           |
| Language   | TypeScript 5 — strict                   | No `any`, no `// @ts-ignore`              |
| Styling    | Tailwind CSS v4                         | Layout / spacing only — see Design System |
| Fonts      | Geist Sans + Geist Mono via `next/font` |                                           |
| Deployment | Vercel                                  | Auto-deploy from `main`                   |
| License    | MIT                                     | `LICENSE` file in repo root               |

---

## Project Structure

Every project follows this layout under `src/`:

```
src/
├── app/
│   ├── layout.tsx        # Root layout — wraps with providers, sets metadata
│   ├── page.tsx          # Main page — composes panels, wires up hooks
│   ├── globals.css       # CSS custom properties + Tailwind import + @variant dark
│   └── icon.svg          # Favicon (Next.js picks it up automatically)
├── components/           # UI components — presentational, no business logic
├── context/              # React contexts (theme, etc.)
├── hooks/                # Custom hooks — all business/simulation logic lives here
├── i18n/
│   ├── locales.ts        # LocaleCode type, LOCALES map — safe for server + client
│   ├── request.ts        # next-intl server config (locale detection)
│   └── useLocale.ts      # Client hook — locale state + changeLocale()
└── types/                # Shared TypeScript interfaces and types
```

Root level:

```
messages/
├── en.json               # English strings
├── cs.json               # Czech strings
├── de.json               # German strings
└── fr.json               # French strings
```

Rules:

- `components/` contains only presentational components
- `hooks/` owns all state and logic — components just render and call callbacks
- `types/` contains only interfaces/types, no runtime code
- No barrel `index.ts` files — import directly from the file

---

## Design System

### Theming

Dark/light mode is controlled by a `.dark` class on `<html>`, managed by `next-themes` via `ThemeContext`.
Colors are defined as CSS custom properties in `globals.css`:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

:root {
    --bg-base: #f1f5f9;
    --bg-panel: #ffffff;
    --bg-panel-alt: #f8fafc;
    --bg-panel-solid: #ffffff; /* Always opaque — use for dropdowns/modals */
    --border: #e2e8f0;
    --text-primary: #0f172a;
    --text-muted: #64748b;
    --text-subtle: #94a3b8;
}

.dark {
    --bg-base: #0f172a;
    --bg-panel: rgba(30, 41, 59, 0.6);
    --bg-panel-alt: rgba(15, 23, 42, 0.7);
    --bg-panel-solid: #1e293b;
    --border: rgba(51, 65, 85, 0.5);
    --text-primary: #f1f5f9;
    --text-muted: #94a3b8;
    --text-subtle: #64748b;
}
```

> **Tailwind v4 dark variant** — In Tailwind v4, `dark:` utilities do **not** work automatically via `.dark` class.
> The `@variant dark` directive in `globals.css` must be present for `dark:block`, `dark:hidden`, etc. to work.

### Color Rules

- **Never** use Tailwind color utilities like `bg-white`, `text-black`, `bg-slate-800` for themed elements
- **Always** use `style={{ color: "var(--text-muted)" }}` or similar
- Tailwind is used **only** for layout, spacing, flex, grid, border-radius, transitions, shadows
- Floating elements (dropdowns, modals) must use `--bg-panel-solid` — never semi-transparent `--bg-panel`

### Accent & Status Colors

These can use Tailwind directly since they don't change with the theme:

| Purpose                | Color                       |
|------------------------|-----------------------------|
| Primary accent         | `violet-500` / `violet-600` |
| Success / low error    | `emerald-500`               |
| Warning / medium error | `amber-500`                 |
| Error / high deviation | `rose-500`                  |

### Spacing & Shape

- Cards / panels: `rounded-2xl`, `p-5`
- Buttons: `rounded-xl`, `py-2.5 px-4`
- Small controls (badges, pills): `rounded-lg`, `px-3 py-1.5`
- Border on all panels: `style={{ borderColor: "var(--border)" }}`

---

## Architecture Principles

### 1. Logic in Hooks, Not Components

All business logic, state, and side effects live in `hooks/`. Components only:

- Render based on props
- Call callbacks passed in as props
- Hold purely local UI state (e.g. open/closed dropdown)

### 2. Fully Controlled Components

Components must never maintain a local copy of a prop and mutate it.

```ts
// ❌ Wrong — draft gets out of sync after external reset
const [draft, setDraft] = useState(config);

// ✅ Correct — always derive from props
function update(partial) {
    onConfigChange({...config, ...partial});
}
```

### 3. Derive, Don't Sync

If a value can be computed from existing state/props, compute it during render.
Do not use `useEffect` to sync one state variable from another.

```ts
// ❌ Wrong
useEffect(() => setSomething(derive(prop)), [prop]);

// ✅ Correct
const something = derive(prop); // computed on every render
```

### 4. Ref-First for Animations

For animation loops (e.g. `requestAnimationFrame`):

- Keep the mutable working data in refs (`useRef`)
- Flush to React state **at most once per ~80ms** to avoid saturating the main thread
- Always flush on pause/stop so the UI reflects final state

### 5. Imperative Canvas via forwardRef

Canvas components use `forwardRef` + `useImperativeHandle` to expose imperative methods
(e.g. `appendItems`, `fullRedraw`). The parent hook holds the ref and calls these directly
from the animation loop — bypassing React's render cycle entirely for per-frame drawing.

### 6. Context Placement

- `ThemeProvider` wraps the entire app in `layout.tsx`
- Other providers follow the same pattern
- Never nest providers inside page components

---

## Component Conventions

### Props

- All props are explicitly typed — no `any`, no implicit `{}` types
- Components call `useTranslations()` directly — never receive `t` as a prop

### Exports

- `default export` for page components (`app/page.tsx`, `app/layout.tsx`)
- `export default` for components in `components/`
- Named exports for everything in `hooks/`, `types/`, `i18n/`, `context/`

### "use client"

Add `"use client"` only where necessary:

- Components that use hooks (`useState`, `useEffect`, `useRef`, etc.)
- Components with browser APIs (`canvas`, `window`, `document`)
- Do **not** add it to pure presentational server components

### React Compiler Rules

The project uses the React Compiler (`babel-plugin-react-compiler`). These patterns will error:

```ts
// ❌ setState directly in useEffect body
useEffect(() => {
    setState(value);
});

// ❌ Mutating a ref during render
myRef.current = something; // must be inside useEffect or event handler

// ❌ Reading a ref during render in a way that affects output
```

---

## i18n

- **Library:** `next-intl`
- Translation strings live in `messages/{locale}.json` files
- Shared locale metadata (`LocaleCode`, `LOCALES`, `locales`) in `src/i18n/locales.ts` — safe to import from both server
  and client
- Server-side locale detection in `src/i18n/request.ts` — reads cookie first, then `Accept-Language` header, falls back
  to `"en"`
- Client-side switching via `useLocale()` hook — writes a cookie and reloads the page

### Using translations in components

Call `useTranslations()` directly inside each component that needs strings — do **not** pass `t` as a prop.

```ts
// ✅ Correct — call it where you need it
import {useTranslations} from "next-intl";

export default function MyComponent() {
    const t = useTranslations();
    return <p>{t("someKey"
)
}
    </p>;
}
```

Passing `t` as a prop was a pattern from the old custom hook and adds unnecessary coupling.

### Interpolation

```ts
// Simple value interpolation
t("descSpeedSlow", {n: 10})  // "One needle every 10 frames"
```

### Adding a new string

1. Add the key + English string to `messages/en.json`
2. Add the **same key** to ALL other `messages/*.json` files — missing keys cause runtime errors
3. TypeScript will catch missing keys at build time

### LaTeX in translation strings

Translation strings may contain inline LaTeX wrapped in `$...$`. Use the `MathText` component to render them:

```tsx
import {MathText} from "@/components/Math";

// In JSX — renders $\pi$ as a proper KaTeX symbol
<p><MathText text={t("someKey")}/></p>
```

In JSON files, backslashes must be escaped:

```json
"appSubtitle": "Estimating $\\pi$ through geometric probability",
"infoCondition": "Let $y_c$ be the distance and $\\theta$ the angle."
```

For standalone block equations (not from translations), use the `Math` component directly:

```tsx
import Math from "@/components/Math";

<Math block math={String.raw`P = \frac{2l}{d\pi}`}/>
```

The `Math` and `MathText` components live in `src/components/Math.tsx`. KaTeX CSS is imported globally in `layout.tsx`.

### Adding a new locale

1. Add the code to `LocaleCode` in `src/i18n/locales.ts`
2. Add entry to `LOCALES` map with flag emoji and label
3. Add detection rule to `detectLocale()` in `src/i18n/request.ts`
4. Create `messages/{code}.json`

---

## Standard UI Elements

Every project includes these by default:

### Header

- App icon (rounded-lg, `bg-violet-600`, shows a relevant symbol)
- Title + subtitle
- `?` info button → opens an `InfoModal` (portal, closeable via Escape / backdrop / ×)
- Theme toggle — SVG sun/moon icons, both always rendered, visibility controlled via `dark:hidden` / `dark:block`
- `LocaleSwitcher` dropdown

### Footer

- Copyright `© YEAR @Sejtam_` with link to `https://github.com/sejtam-dev`
- GitHub repo link with GitHub icon
- Star button → main repo page (NOT `/stargazers`) — shows live star count badge fetched from GitHub API
- Fork button → `repo/fork` — shows live fork count badge fetched from GitHub API
- Counts are fetched client-side via `https://api.github.com/repos/{owner}/{repo}` on mount; if the request fails the
  badges are simply hidden (no error shown)

### InfoModal

- Rendered via `createPortal` into `document.body`
- Closes on: Escape key, backdrop click, × button
- Locks body scroll while open
- Background: `--bg-panel-solid` (always opaque)

---

## CI/CD

### GitHub Actions — `.github/workflows/ci.yml`

Runs on every push and pull request to `main`:

1. Checkout
2. Node.js 20 setup with `npm` cache
3. `npm install` (**not** `npm ci` — lock file generated on Windows is not compatible with the Linux runner)
4. `npm run lint`
5. `npm run build`

> **Why `npm install` instead of `npm ci`?**
> `npm ci` requires the lock file to be 100% in sync with the runner's platform. Since `package-lock.json`
> is generated on Windows, platform-specific packages (e.g. `@swc/helpers`) may differ on the Linux CI
> runner, causing `npm ci` to fail with `EUSAGE`. Using `npm install` resolves this transparently.

### Vercel

- Connected to GitHub — auto-deploys on push to `main`
- No extra configuration needed for Next.js projects
- Preview deployments are created for every PR automatically

---

## Repository Setup Checklist

When starting a new project:

- [ ] `README.md` — project description, math/logic explanation, getting started, stack table
- [ ] `LICENSE` — MIT, year + `sejtam-dev`
- [ ] `.github/workflows/ci.yml` — lint + build
- [ ] `.editorconfig` — UTF-8, LF, 2 spaces, trim trailing whitespace
- [ ] `.gitignore` — includes `.idea/`, `.vscode/`, `Thumbs.db`
- [ ] `package.json` — `"license": "MIT"`
- [ ] `src/app/icon.svg` — custom favicon as SVG
- [ ] GitHub repo: Description + Topics set

### README Badge Template

```markdown
[![CI](https://github.com/sejtam-dev/REPO/actions/workflows/ci.yml/badge.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-URL-7c3aed)](https://URL)
```

### GitHub Description Template

```
Interactive [what it does] — [one sentence about the output/goal]. Built with Next.js, TypeScript and Canvas API.
```

### GitHub Topics Template

```
nextjs typescript tailwindcss canvas simulation math [domain-specific tags]
```

---

## Common Pitfalls

| ❌ Don't                                                                | ✅ Do instead                                                                            |
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| Hardcode colors in Tailwind (`text-slate-400`)                         | Use `style={{ color: "var(--text-muted)" }}`                                            |
| Use `--bg-panel` for dropdowns/modals                                  | Use `--bg-panel-solid`                                                                  |
| Initialize state from props and mutate locally                         | Work directly with props (controlled component)                                         |
| Call `setState` inside `useEffect` body                                | Derive the value during render                                                          |
| Pass `t` as a prop to components                                       | Call `useTranslations()` directly in the component                                      |
| Put logic/state inside components                                      | Move it to a custom hook                                                                |
| Write `any` types                                                      | Define a proper interface in `types/`                                                   |
| Multiline className strings (causes SSR hydration mismatch on Windows) | Keep className on a single line                                                         |
| Add a key to only one `messages/*.json`                                | Add the key to **all** locale files simultaneously                                      |
| Write math symbols as plain text (`π`, `y_c`, `θ`)                     | Use `$\\pi$`, `$y_c$`, `$\\theta$` in translations + `MathText` in JSX                  |
| Use `\\\\pi` (four backslashes) in JSON                                | Use `\\pi` (two backslashes) — JSON needs one escape level, LaTeX needs one             |
| Use `npm ci` in CI on a Windows-generated lock file                    | Use `npm install` — avoids platform-specific dependency mismatch                        |
| Use inline script + custom ThemeContext for dark mode                  | Use `next-themes` — handles SSR, hydration and localStorage automatically               |
| Read `document.documentElement.classList` during render                | Use `useTheme()` from `ThemeContext` which wraps `next-themes`                          |
| Conditionally render different JSX for dark/light icon                 | Render both SVGs, control visibility with `dark:hidden` / `dark:block`                  |
| Forget `@variant dark` in `globals.css` with Tailwind v4               | Always include `@variant dark (&:where(.dark, .dark *));` after `@import "tailwindcss"` |
| Use `typeof window !== 'undefined'` for theme detection                | Use `next-themes` — causes hydration mismatch on Vercel                                 |

---

## Theme Initialisation

Theme is managed by **`next-themes`** (`ThemeProvider` from `next-themes` wrapped in a local `ThemeContext` bridge).

### Setup

`layout.tsx`:

```tsx
// <html> must have suppressHydrationWarning — next-themes sets class before hydration
<html lang={locale} suppressHydrationWarning>
<body>
<ThemeProvider>  {/* from src/context/ThemeContext.tsx */}
    {children}
</ThemeProvider>
</body>
</html>
```

`ThemeContext.tsx`:

```tsx
import {ThemeProvider as NextThemesProvider, useTheme as useNextTheme} from "next-themes";

export function ThemeProvider({children}) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <ThemeContextBridge>{children}</ThemeContextBridge>
        </NextThemesProvider>
    );
}
```

`globals.css` — required for `dark:` Tailwind utilities to work:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));
```

### Theme Toggle Icon Pattern

Always render **both** icons and toggle visibility via CSS — this avoids hydration mismatches because the HTML is
identical on server and client:

```tsx
{/* Sun — shown in dark mode */
}
<svg className="hidden dark:block" ...>...</svg>
{/* Moon — shown in light mode */
}
<svg className="block dark:hidden" ...>...</svg>
```

**Never** conditionally render one icon based on `theme === "dark"` — this causes React hydration errors on Vercel
because the server renders with the default theme but the client immediately knows the stored theme.

### `useTheme()` hook

`ThemeContext` exposes:

```ts
const {theme, toggle, mounted} = useTheme();
// theme:   "dark" | "light"  (always "dark" on server / before mount)
// toggle:  () => void
// mounted: boolean  — true only after client hydration; use to guard theme-dependent non-CSS rendering
```

---

## LaTeX Escaping in JSON

In JSON files, each backslash must be escaped once for JSON, so a single LaTeX backslash `\` becomes `\\`:

```json
// ✅ Correct
"appSubtitle": "Estimating $\\pi$ through geometric probability",
"infoCondition": "Let $y_c$ be the distance and $\\theta$ the angle.",
"infoConstraint": "Short-needle case $l \\leq d$."

// ❌ Wrong — double-escaped, renders as literal \\pi in the browser
"appSubtitle": "Estimating $\\\\pi$ through geometric probability",
// ❌ Wrong — escaped dollar sign, not treated as LaTeX delimiter
"infoSetup": "A needle of length \\$l\\$ is dropped..."
```

When reviewing or writing JSON translation files, **one `\\` per LaTeX backslash** is always correct.
Do not "fix" correct `\\pi` to `\\\\pi` — that breaks rendering.

---

## MathText Spacing

`MathText` in `src/components/Math.tsx` automatically handles spacing around inline LaTeX:

- Adds a small **left gap** unless the preceding text already ends with a space
- Adds a small **right gap** unless the following text starts with punctuation (`.`, `,`, `;`, `:`, `!`, `?`, `)`) or a
  space
- Do **not** manually add spaces around `$...$` delimiters in translation strings — `MathText` handles this
