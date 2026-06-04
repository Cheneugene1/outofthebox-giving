# Out of the Box Giving - Product Plan

## Basic Info

**Project name:** Out of the Box Giving

**Domain:** `outofthebox.giving`

**Subtitle:** Open a small act of kindness. Leave one for the next stranger.

**One-liner:**

Out of the Box Giving is an AI-powered kindness box. Users open the box to receive one small useful thing left by a stranger. When they leave their own message, AI transforms sharp, unsafe, or unsuitable language into something gentle, useful, and shareable.

**Core idea:**

> Most moderation says no. This box transforms.

This is not a charity platform, social network, donation tool, or AI safety dashboard. It is a small polished product interaction:

> Open kindness. Transform harm. Leave something useful.

## Hackathon Goal

Build a complete 2-minute demo loop for DevWeek:

1. Open the box.
2. Receive a useful anonymous giving.
3. Leave a message.
4. AI reviews the message.
5. Sharp words are visually transformed into kindness words.
6. AI creates a publishable rewrite.
7. User confirms publishing.
8. The new giving enters the box.
9. Small stats update.

Judging criteria this project targets:

- Creative interpretation: redefining giving as a tiny useful thing, not money or obligation.
- Technical execution: AI risk detection, structured JSON output, rewrite flow, fallback behavior.
- Product polish: box animation, transformation animation, clean state transitions, stable demo.
- Strength of concept: moderation becomes transformation.
- Connection to domain: `outofthebox` is both the box interaction and the nontraditional interpretation of giving; `.giving` is the user action.

## MVP Scope

Build one single-page experience with these states:

1. `closed_box`
   - Box is closed.
   - User sees title, subtitle, and `Open the box`.

2. `opening`
   - Short box opening animation.

3. `giving_card`
   - Shows one giving.
   - Buttons:
     - `Helped me`
     - `Open another`
     - `Leave one`

4. `compose`
   - Text input.
   - Max 280 characters.
   - Button: `Put it in the box`.

5. `reviewing`
   - AI review loading state.
   - Text: `The box is reading your giving...`

6. `translation_result`
   - Shows kindness translation.
   - Shows publishable rewrite.
   - Button: `Give this version`.
   - Button: `Try again`.

7. `published`
   - Success state.
   - Text: `Your giving is in the box. Someone may open it next.`

8. `blocked`
   - High-risk or low-quality content is not published.
   - Shows a gentle suggestion.
   - Button: `Try again`.

## Explicitly Out of Scope

Do not build these in the MVP:

- Login or user accounts
- User profiles
- Comments
- Private messages
- Scheduling or matching
- Donations or payments
- Category filtering
- Admin dashboard
- Full report system
- Full multilingual support
- Recommendation algorithm
- Complex charts

The goal is a small, memorable, complete product loop.

## Core User Flow

### Flow A: Open A Giving

1. User lands on the page.
2. User clicks `Open the box`.
3. Frontend calls `GET /api/open`.
4. Box opening animation plays.
5. A giving card appears.
6. User can click:
   - `Helped me`
   - `Open another`
   - `Leave one`

### Flow B: Leave A Giving

1. User clicks `Leave one`.
2. User writes a message up to 280 characters.
3. User clicks `Put it in the box`.
4. Frontend calls `POST /api/submit`.
5. Backend auto-detects language:
   - If Chinese characters are more than 30% of text, use `zh`.
   - Otherwise use `en`.
6. AI returns structured review JSON.
7. Publishing decision:
   - `low` risk + `qualityScore >= 60`: allow original text to publish.
   - `medium` risk + `qualityScore >= 60`: show kindness translation and rewrite; user can publish rewrite.
   - `high` risk: block publishing.
   - Any `qualityScore < 60`: block publishing and ask for something more specific.
8. User confirms publishable version.
9. Frontend calls `POST /api/publish`.
10. Stats update.

## Content Rules

A good giving should be:

- Short
- Specific
- Immediately useful
- Useful to a stranger
- Not dependent on the author replying later
- Free to use
- Anonymous
- Not a personal contact invitation
- Not a medical, legal, or financial certainty
- Not an attack on a person or group

Good examples:

```text
改简历时，把一句“负责某事”改成“做了什么 + 数字 + 结果”。
```

```text
Before debugging, write what you expected, what happened, and the smallest test you can run next.
```

```text
如果事情太多，先写下一个小到两分钟能完成的动作。
```

```text
Before giving feedback, write one sentence about what worked before naming what confused you.
```

Avoid empty content like:

```text
Be kind.
Stay positive.
Believe in yourself.
```

## Kindness Translation

Kindness translation is a visual product moment, not the final published content.

It replaces risky spans with positive words so users can see sharp language being softened.

Chinese kindness words:

```text
可爱
善意
和平
谢谢你
你很棒
大爱
我爱你
```

English kindness words:

```text
kindness
care
peace
love
thank you
you matter
gentle
```

Example:

Original:

```text
你这个想法太蠢了，加我微信我帮你重写。
```

Kindness translation:

```text
你这个想法太可爱了，善意我帮你重写。
```

Publishable rewrite:

```text
给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。
```

Important:

- The translation can be slightly funny or grammatically imperfect.
- It is only a visible transformation moment.
- The database should store the original only if it is low risk and useful.
- For medium risk content, store only `publishableRewrite`.

## AI Review JSON

Backend should ask AI to return strict JSON:

```json
{
  "language": "zh",
  "riskLevel": "medium",
  "flags": ["insult", "personal_contact"],
  "unsafeSpans": ["太蠢", "加我微信"],
  "kindnessTranslation": "你这个想法太可爱了，善意我帮你重写。",
  "publishableRewrite": "给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。",
  "qualityScore": 86,
  "shouldPublishOriginal": false,
  "shouldOfferRewrite": true,
  "softenedWordCount": 2,
  "suggestionForUser": "Try making it general, anonymous, and useful to a stranger.",
  "reason": "The original contains an insult and a private contact invitation."
}
```

Risk levels:

- `low`: no clear safety issue; content is specific and useful.
- `medium`: contains an insult, contact invitation, spam-like phrasing, privacy issue, or risky claim, but can be safely rewritten.
- `high`: self-harm crisis, violent threat, hate, sexual content, serious privacy leak, scam, or content that cannot be safely rewritten.

Quality score:

- `80-100`: strong, specific, useful.
- `60-79`: acceptable.
- `<60`: too vague, too empty, or not useful enough to publish.

## AI Prompt Requirements

The system prompt should include these rules:

- You are a kindness transformer, not only a moderation classifier.
- Only flag genuinely unsafe or unsuitable parts: insults, harassment, hate, private contact, ads, privacy leaks, dangerous advice, scams.
- Do not flag ordinary frustration, constructive criticism, or direct but useful advice.
- Do not turn self-harm or mental health crisis content into cute/kindness words. Mark it high risk and provide a supportive suggestion.
- Do not provide deterministic medical, legal, or financial advice.
- Rewrite must be short, specific, safe, anonymous, and immediately useful to a stranger.
- If content cannot be safely rewritten, mark it high risk.
- Output only valid JSON.
- Do not output Markdown.

Suggested few-shot cases to include:

1. Normal useful content:
   - Input: `Before debugging, write what you expected and what actually happened.`
   - Output: low risk, publish original.

2. Medium risk:
   - Input: `你这个想法太蠢了，加我微信我帮你重写。`
   - Output: medium risk, spans `太蠢`, `加我微信`, rewrite to a general feedback tip.

3. High risk:
   - Input: self-harm crisis content.
   - Output: high risk, no cute transformation, supportive suggestion, do not publish.

4. Low quality:
   - Input: `Be good.`
   - Output: low risk but qualityScore below 60, ask for a more specific tip.

## API Design

### `GET /api/open?exclude_ids=...&featured=...`

Returns one giving.

Query params:

- `exclude_ids`: comma-separated IDs recently opened by this browser.
- `featured`: optional giving ID. Only honored in demo mode so the newly published giving can be shown immediately.

Response:

```json
{
  "id": "g_123",
  "content": "Before debugging, write what you expected and what actually happened.",
  "language": "en",
  "helpedCount": 12
}
```

Behavior:

- Exclude IDs from `exclude_ids` when possible.
- Ignore hidden givings.
- Increment `open_box` event/stat.
- In demo mode, if `featured` is valid, return it first.

### `POST /api/submit`

Input:

```json
{
  "text": "你这个想法太蠢了，加我微信我帮你重写。"
}
```

Response:

Returns the AI review JSON.

Behavior:

- Enforce max length.
- Auto-detect language.
- Call AI unless `DEMO_MODE=true`.
- Timeout after 3 seconds.
- If AI fails, JSON parsing fails, or timeout occurs, return mock review.

### `POST /api/publish`

Input:

```json
{
  "content": "给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。",
  "language": "zh",
  "sourceType": "user_rewrite",
  "softenedWordCount": 2
}
```

Response:

```json
{
  "ok": true,
  "givingId": "g_456"
}
```

Behavior:

- Insert giving.
- Increment `published`.
- Increment `softened` by `softenedWordCount`.
- Return new ID.

### `POST /api/helped`

Input:

```json
{
  "givingId": "g_123"
}
```

Response:

```json
{
  "ok": true,
  "helpedCount": 13
}
```

## Data Model

MVP can use two tables.

### `givings`

```text
id
content
language
sourceType      seed | user_original | user_rewrite
helpedCount
createdAt
hidden
```

### `events`

```text
id
type            open_box | helped | submitted | published | softened
count
createdAt
```

For the hackathon MVP, stats can also be derived from givings and events.

Stats shown in UI:

```text
Boxes opened
Givings left
Sharp words softened
```

## Demo Stability Requirements

These are important. Build them early.

1. `DEMO_MODE=true`
   - `/api/submit` returns fixed mock output.
   - No dependency on live AI or network.

2. AI timeout
   - If AI takes longer than 3 seconds, fallback to mock review.

3. JSON fallback
   - Try to extract the first JSON object from AI response.
   - If parse fails, fallback to mock review.

4. Seed check
   - On startup or seed script, ensure at least 40 seed givings exist.

5. Open dedupe
   - Store last 30 opened IDs in `localStorage`.
   - Send them as `exclude_ids` to `/api/open`.

6. Featured demo return
   - After publishing, store the new giving ID.
   - In demo mode, pass it as `featured` when opening another box.
   - This guarantees the demo loop can show the newly created giving.

## Frontend Notes

Recommended stack:

- Next.js
- React
- Tailwind CSS
- Framer Motion, or simple CSS animations if time is tight

Keep it as a single route.

Use one state machine-like `useState` for the main view:

```text
closed_box
opening
giving_card
compose
reviewing
translation_result
published
blocked
```

Visual priorities:

1. The box is the first visual signal.
2. The card should feel like a small note pulled from the box.
3. The transformation animation is the demo highlight.
4. Stats should be visible but quiet.

Avoid:

- Long explanatory text
- Too many cards
- Charity website styling
- Heavy dashboard UI
- Generic purple gradient SaaS look

## UI Copy

Title:

```text
Out of the Box Giving
```

Subtitle:

```text
Open a small act of kindness. Leave one for the next stranger.
```

Buttons:

```text
Open the box
Helped me
Open another
Leave one
Put it in the box
Give this version
Try again
```

Review loading:

```text
The box is reading your giving...
```

Medium risk result:

```text
We softened the sharp parts.
Here is a version a stranger can actually use.
```

High risk result:

```text
This one is too sensitive to put in a public box.
Try turning it into a small, general, useful tip.
```

Published:

```text
Your giving is in the box.
Someone may open it next.
```

## Seed Content Plan

Prepare around 40 seed givings.

Suggested mix:

- 10 career/resume
- 8 emotional/calm
- 8 developer/study
- 6 communication
- 4 life/admin
- 4 food/creative

Quality bar:

- Under 280 characters.
- One specific action.
- Useful without context.
- No vague encouragement.

## Demo Bad Cases

Prepare at least these:

Chinese:

```text
你这个想法太蠢了，加我微信我帮你重写。
```

English:

```text
Your resume is trash. DM me and I will fix it for you.
```

Expected Chinese rewrite:

```text
给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。
```

Expected English rewrite:

```text
Before sharing a resume, replace one vague duty with a clear action, a number, and the result.
```

## Suggested 24-Hour Build Plan

### 0-3 hours

- Scaffold app.
- Define visual direction.
- Create seed data.
- Implement `/api/open`.

### 3-7 hours

- Build homepage box.
- Build giving card.
- Implement `Helped me`.
- Implement `Open another`.

### 7-12 hours

- Build compose state.
- Implement `/api/submit`.
- Add AI prompt.
- Add demo/mock mode.

### 12-16 hours

- Build translation result UI.
- Implement `Give this version`.
- Implement `/api/publish`.

### 16-20 hours

- Add animation polish.
- Add stats.
- Add timeout, JSON fallback, and seed check.

### 20-24 hours

- Finalize seed content.
- Prepare demo bad cases.
- Deploy or stabilize local demo.
- Rehearse 2-minute pitch.

## Demo Script

Opening:

> Most giving platforms ask for money, time, or commitment. We asked: what if giving could be as small as one useful thing left for a stranger?

Steps:

1. Click `Open the box`.
2. Show a useful seed giving.
3. Click `Leave one`.
4. Enter:

```text
你这个想法太蠢了，加我微信我帮你重写。
```

5. Show kindness translation:

```text
你这个想法太可爱了，善意我帮你重写。
```

6. Show publishable rewrite.
7. Click `Give this version`.
8. Open another box and show the new giving in demo mode.
9. Point to stats update.

Closing:

> Out of the Box Giving turns moderation from rejection into transformation. You open kindness, transform harm, and leave something useful behind.

## Likely Judge Questions

### How do you make sure rewritten content is actually useful?

AI returns a quality score. Below 60 is not published. We also track `Helped me` as a simple feedback signal. For the MVP, seed content is curated manually.

### What happens if someone submits self-harm content?

We do not turn crisis content into cute words. The prompt marks it high risk, blocks publishing, and shows a supportive suggestion to reach out to a trusted person or professional.

### Why no login?

Anonymity lowers the barrier to leaving small useful help. The MVP uses rate limits and session-level controls. A future version could add optional identity.

### Why use AI?

Without AI, this is just a message box. AI is the core product mechanism: it transforms unsafe or sharp expression into a safe, useful giving.

### What if the AI or network fails during the demo?

The product has `DEMO_MODE`, timeout fallback, and mock review responses so the core loop still works.

## Final Build Advice

Build in this order:

1. Make opening the box feel good.
2. Make seed content high quality.
3. Make demo mode bulletproof.
4. Add real AI only after the UI loop works.
5. Polish the transformation animation last.

The winning version is not the one with the most features. It is the one where the core action feels inevitable:

> Open kindness. Transform harm. Leave something useful.
