# DeFiPal

A modern AI-powered DeFi assistant for Sonic DeFi ecosystem.

## Features

- 🤖 AI-powered chat interface for DeFi assistance
- 💬 Real-time conversation with DeFiPal AI
- 🎨 Beautiful glass morphism UI with Tailwind CSS
- ⚡ Fast and responsive design
- 🔒 Secure API integration with OpenRouter

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site Configuration (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=DeFiPal
```

### 3. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Integration

The app uses OpenRouter's API to power the AI chat functionality. The AI is specifically trained to help with:

- Token swapping and exchanges
- Checking wallet balances
- Finding farming opportunities
- Managing staking positions
- Providing DeFi education and guidance

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with glass morphism effects
- **Animations**: Framer Motion
- **AI**: OpenRouter API with DeepSeek model
- **TypeScript**: Full type safety

## Project Structure

```
defipal/
├── app/
│   ├── api/llm/route.ts    # LLM API endpoint
│   ├── globals.css         # Global styles
│   └── page.tsx           # Main chat interface
├── components/             # React components
├── types/                 # TypeScript type definitions
└── styles/               # Additional styles
```
