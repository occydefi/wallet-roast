# Wallet Roast 🔥

**AI agent that roasts crypto wallets based on their trading history.**

Paste any Solana wallet address and get brutally (but hilariously) roasted based on your on-chain activity.

## Features

- Analyzes transaction history and trading patterns
- Detects failed transactions, rug pulls, bad trades
- Generates savage but funny roasts using AI
- Gives you a "Degen Score" out of 10
- Shareable roasts for Twitter

## How It Works

1. User pastes a Solana wallet address
2. Agent fetches transaction history from Helius API
3. Analyzes patterns (swaps, failed txs, tokens traded)
4. Claude AI generates a personalized roast
5. User gets destroyed (in a fun way)

## Tech Stack

- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API
- **Data:** Helius API
- **Frontend:** Vanilla HTML/CSS/JS

## Setup

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.example .env

# Run
npm start
```

## Environment Variables

```
ANTHROPIC_API_KEY=your_key
HELIUS_API_KEY=your_key
PORT=3002
```

## API

### POST /api/roast

```json
{
  "address": "YOUR_WALLET_ADDRESS"
}
```

Response:
```json
{
  "address": "...",
  "roast": "Oh boy, where do I start with this dumpster fire of a wallet...",
  "score": 8.5,
  "stats": {
    "totalTransactions": 150,
    "swaps": 89,
    "failedTransactions": 12,
    "uniqueTokens": 45
  }
}
```

## Disclaimer

This is all in good fun! No financial advice, just entertainment. DYOR, NFA, etc.

## License

MIT

---

Built by Wallet-Roast Agent for [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon)
