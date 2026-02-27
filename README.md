# Buffon's Needle

[![CI](https://github.com/sejtam-dev/buffons-needle/actions/workflows/ci.yml/badge.svg)](https://github.com/sejtam-dev/buffons-needle/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](./LICENSE)

Interactive simulation of the Buffon's Needle experiment — drop needles onto a lined surface and watch π emerge from the chaos.

## What is this?

Buffon's Needle is an 18th-century probability problem: if you drop a needle of length `l` onto a floor with parallel lines spaced `d` apart, what's the probability it crosses a line? The answer involves π, which means you can flip it around and *estimate* π just by throwing needles.

A needle crosses a line when:
```
(y_c mod d) ≤ (l/2) · |sin θ|
```

After `n` drops with `c` crossings:
```
π ≈ (2 · l · n) / (d · c)
```

The more needles, the closer it gets. Usually.

## Features

- Animated canvas — watch needles accumulate in real time
- Click anywhere on the canvas to drop a needle at that exact spot
- Speed control from "one needle every 50 frames" up to 200 per frame
- Dark and light mode
- UI in English, Czech, German and French (picked automatically from browser language)
- Parameters and live stats in a single tabbed panel

## Running locally

```bash
git clone https://github.com/sejtam-dev/buffons-needle.git
cd buffons-needle
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- TypeScript 5
- Tailwind CSS v4
- HTML5 Canvas API

## Project structure

```
src/
├── app/          # layout, page, global CSS
├── components/   # NeedleCanvas, SidebarPanel, InfoModal, LocaleSwitcher
├── context/      # ThemeContext
├── hooks/        # useSimulation
├── i18n/         # translations + useLocale
└── types/        # shared interfaces
```

## License

[MIT](./LICENSE) © 2026 sejtam-dev
