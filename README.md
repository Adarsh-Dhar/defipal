# DeFiPal - AI-Powered Sonic DeFi Assistant

A modern, AI-powered DeFi assistant for Sonic blockchain operations with a beautiful glass-morphism UI.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 What's Fixed

### ✅ Hydration Errors
- Added `suppressHydrationWarning` to prevent server/client rendering mismatches
- Implemented proper mounting states for wallet connection components
- Fixed client-side only content rendering issues

### ✅ Wallet Connection Issues
- Removed problematic WalletConnect configuration that was causing 403 errors
- Simplified to use only MetaMask and Coinbase Wallet connectors
- Added proper error handling for wallet connection attempts
- Improved fallback logic when MetaMask is not available

### ✅ UI/UX Improvements
- Maintained the beautiful glass-morphism aesthetic
- Added proper loading states and error handling
- Ensured responsive design with Tailwind CSS

## 🎨 Features

- **AI-Powered Chat Interface**: Intelligent assistant for DeFi operations
- **Wallet Integration**: Connect with MetaMask or Coinbase Wallet
- **Sonic Blockchain Support**: Native integration with Sonic testnet
- **Modern UI**: Glass-morphism design with smooth animations
- **Dark/Light Mode**: Theme toggle with system preference detection

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom glass-morphism effects
- **Animations**: Framer Motion
- **Wallet**: Wagmi + Viem for blockchain interactions
- **AI**: OpenRouter API for intelligent responses
- **UI Components**: Radix UI primitives

## 🔗 Blockchain Integration

The app is configured for Sonic Blaze testnet:
- **RPC URL**: `https://rpc.blaze.soniclabs.com`
- **Chain ID**: 57054
- **Supported Operations**: Token transfers, staking, bridging, and more

## 🚨 Troubleshooting

If you encounter any issues:

1. **Wallet Connection**: Make sure MetaMask is installed and connected to Sonic testnet
2. **AI Responses**: Check that the OpenRouter API key is properly configured
3. **Hydration Errors**: Clear browser cache and restart the development server

## 📝 Environment Variables

Create a `.env.local` file with:
```
OPENROUTER_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=DeFiPal
```

## 🎯 Next Steps

The app is now ready for development! The hydration errors have been resolved and wallet connection should work properly with MetaMask and Coinbase Wallet.
