# Out of the Box Giving

Open a small act of kindness. Leave one for the next stranger.

Out of the Box Giving is an AI-powered kindness box built for the DeveloperWeek New York 2026 Hackathon Domain Roulette challenge. The project reimagines `outofthebox.giving` as a place where giving is not money, obligation, or scheduling. It can be one small useful thing left for someone you may never meet.

## Live Demo

- Demo: https://outofthebox-giving.vercel.app
- Video: https://youtu.be/gfebM2_MEVk
- GitHub: https://github.com/Cheneugene1/outofthebox-giving

## What It Does

Users open a virtual box and receive a short, practical giving from a stranger. They can mark it helpful, open another, or leave one for the next person.

The core interaction is the AI kindness transformation:

1. A user submits a message.
2. The app detects sharp, unsafe, or unsuitable wording.
3. Risky words are visually softened into kindness words.
4. AI creates a safe, useful rewrite.
5. The user can publish the rewritten version into the box.

Example:

```text
Your resume is trash. DM me and I will fix it for you.
```

becomes:

```text
Before sharing a resume, replace one vague duty with a clear action, a number, and the result.
```

Most moderation says no. This box transforms.

## Built With

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- SQLite
- Drizzle ORM
- AI SDK
- DeepSeek API / OpenAI-compatible providers
- Zod
- Vercel

## Demo Mode

The public Vercel demo runs in a judge-safe demo mode so reviewers can always see the full product loop without relying on live AI latency or persistent SQLite writes in a serverless environment.

Set:

```env
DEMO_MODE=true
DATABASE_PATH=./data.db
```

When `DEMO_MODE=true`, the app uses deterministic mock AI responses and built-in seed givings. The code still supports live AI providers through environment variables.

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Optional database setup:

```bash
npm run db:push
npm run db:seed
```

## Environment Variables

```env
DEMO_MODE=true
DATABASE_PATH=./data.db
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

Use `DEMO_MODE=true` for stable demos. To use a live model, set `DEMO_MODE=false`, choose an `AI_PROVIDER`, and provide the corresponding API key.

## Project Philosophy

Traditional giving platforms often ask for money, time, or commitment. This project asks a smaller question:

What if giving could be a sentence, a tiny habit, a practical tip, or a better way to say something?

Out of the Box Giving turns moderation from rejection into transformation:

```text
Open kindness. Transform harm. Leave something useful.
```
