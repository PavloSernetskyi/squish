# Squish - AI Voice Meditation App

A simple, web-only voice meditation app built with Next.js, Supabase, and Vapi.

## Landing page
<img width="1886" height="945" alt="image" src="https://github.com/user-attachments/assets/eadde886-2cb7-4e95-bbb7-49c7d3052c88" />


## Features

- **Authentication**: Email magic link login via Supabase Auth
- **Voice Sessions**: Browser-based voice meditation with AI guide
- **Session Management**: Choose from 5, 10, 15, or 20-minute sessions
- **Call Logging**: Automatic transcription and session summaries stored in Supabase

## Tech Stack

- **Next.js** (App Router, TypeScript, Tailwind) – UI, routing, API routes
- **Supabase** (Auth + Postgres) – user authentication and data storage
- **Vapi** (Voice AI, web SDK) – voice agent runs in browser
- **Vercel** – deployment (optional)

## Quick Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-only)
- `VAPI_API_KEY` - Your Vapi API key (server-only)
- `VAPI_ASSISTANT_ID` - Your Vapi assistant ID

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Enable email authentication in Supabase Auth settings

### 3. Vapi Setup

1. Create a Vapi account and assistant
2. Set up your assistant with the meditation guide prompt (see below)
3. Configure webhook URL: `https://yourdomain.com/api/vapi/webhook`

### 4. Install and Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Vapi Assistant Prompt

Set this as your system prompt in the Vapi dashboard:

```
You are "Squish," a calm meditation guide. Explain the Squish method briefly:

The three inner senses: Touch/Feeling (body + emotions), Hearing (inner dialogue), Sight (imagination).

The flow: Trailhead → Level 1 (adventure/puzzle) → Level 2 (meet characters; they're not you; offer care using touch/words/time/service/gifts) → Level 3 (hidden parts) → Level 4 (Self energy).

Remind: "You are the observer; thoughts/feelings are messages, not your identity."
Use the context variable sessionMinutes to pace the meditation. Ask 1 clarifying question (goal or current feeling), then guide the practice end-to-end within the time. Handle questions and resistance kindly, and summarize at the end.
```

## Project Structure

```
squish/
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx            # Home: login + "Go to Voice"
│  │  └─ voice/page.tsx      # Length picker + Start Voice Session
│  └─ api/
│     └─ vapi/
│        ├─ token/route.ts   # server: mint short-lived Vapi client token
│        └─ webhook/route.ts # server: receive Vapi events → Supabase
├─ components/
│  ├─ AuthButtons.tsx
│  └─ VoicePanel.tsx         # length selector + start/stop
├─ lib/
│  ├─ supabase-client.ts
│  ├─ supabase-server.ts
└─ supabase/
   └─ schema.sql
```

## Usage

1. **Sign Up/Login**: Enter your email and click "Send Magic Link"
2. **Choose Session**: Go to `/voice` and select 5, 10, 15, or 20 minutes
3. **Start Meditation**: Click "Start Voice Session" to begin with your browser mic
4. **Session Data**: All calls, transcripts, and summaries are automatically saved

## Future Enhancements

- Profile page with default duration and timezone settings
- Session history and analytics
- Streak tracking
- Different meditation goals (sleep, stress, focus)
- Mobile app version

## Deployment

Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Make sure to set all environment variables in your Vercel dashboard.
