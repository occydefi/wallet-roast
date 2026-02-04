const Anthropic = require('anthropic').default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchWalletHistory(address) {
  const heliusKey = process.env.HELIUS_API_KEY;

  // Fetch recent transactions
  const txUrl = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusKey}&limit=50`;
  const txResponse = await fetch(txUrl);

  if (!txResponse.ok) {
    throw new Error('Failed to fetch wallet transactions');
  }

  const transactions = await txResponse.json();

  // Fetch balances
  const balanceUrl = `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${heliusKey}`;
  const balanceResponse = await fetch(balanceUrl);
  const balances = balanceResponse.ok ? await balanceResponse.json() : null;

  return { transactions, balances };
}

function analyzeWallet(transactions, balances) {
  const stats = {
    totalTxs: transactions.length,
    swaps: 0,
    transfers: 0,
    nftTrades: 0,
    failedTxs: 0,
    protocols: new Set(),
    tokensTraded: new Set(),
    suspiciousPatterns: [],
  };

  for (const tx of transactions) {
    // Count transaction types
    if (tx.type === 'SWAP') stats.swaps++;
    if (tx.type === 'TRANSFER') stats.transfers++;
    if (tx.type?.includes('NFT')) stats.nftTrades++;
    if (tx.transactionError) stats.failedTxs++;

    // Track protocols
    if (tx.source) stats.protocols.add(tx.source);

    // Track tokens
    if (tx.tokenTransfers) {
      tx.tokenTransfers.forEach(t => {
        if (t.mint) stats.tokensTraded.add(t.mint);
      });
    }

    // Detect suspicious patterns
    if (tx.description?.toLowerCase().includes('rug')) {
      stats.suspiciousPatterns.push('Possible rug pull victim');
    }
  }

  stats.protocols = Array.from(stats.protocols);
  stats.tokensTraded = stats.tokensTraded.size;

  return stats;
}

async function roastWallet(address) {
  // Fetch wallet data
  const { transactions, balances } = await fetchWalletHistory(address);

  if (!transactions || transactions.length === 0) {
    throw new Error('No transaction history found for this wallet');
  }

  // Analyze patterns
  const stats = analyzeWallet(transactions, balances);

  // Build context for Claude
  const prompt = buildRoastPrompt(address, transactions, balances, stats);

  // Get roast from Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const roastText = message.content[0].text;

  // Extract score from roast (Claude includes it)
  const scoreMatch = roastText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

  return {
    address,
    roast: roastText,
    score,
    stats: {
      totalTransactions: stats.totalTxs,
      swaps: stats.swaps,
      failedTransactions: stats.failedTxs,
      uniqueTokens: stats.tokensTraded,
      protocols: stats.protocols.slice(0, 5),
    },
  };
}

function buildRoastPrompt(address, transactions, balances, stats) {
  // Get sample transactions for context
  const sampleTxs = transactions.slice(0, 20).map(tx => ({
    type: tx.type,
    description: tx.description,
    timestamp: tx.timestamp,
    source: tx.source,
    error: tx.transactionError || null,
  }));

  return `You are Wallet-Roast, a savage but funny AI that roasts crypto wallets based on their trading history. You're like a comedy roast but for degens.

Analyze this Solana wallet and deliver a BRUTAL but HILARIOUS roast. Be creative, use crypto slang, and don't hold back.

Wallet: ${address}

Stats:
- Total transactions: ${stats.totalTxs}
- Swaps: ${stats.swaps}
- Failed transactions: ${stats.failedTxs}
- Unique tokens traded: ${stats.tokensTraded}
- Protocols used: ${stats.protocols.join(', ') || 'None detected'}

Recent Transactions Sample:
${JSON.stringify(sampleTxs, null, 2)}

Current Balances:
${balances ? JSON.stringify(balances.tokens?.slice(0, 10), null, 2) : 'Unable to fetch'}

ROAST GUIDELINES:
1. Start with a one-liner hook that's devastatingly funny
2. Point out specific bad trades or patterns you see
3. Use crypto/degen slang (ngmi, gmi, ape, degen, rugged, exit liquidity, etc.)
4. Reference specific tokens if you see any memecoins
5. Mock failed transactions if there are any
6. End with a SCORE out of 10 (where 10 = absolute degen, 1 = boring normie)
7. Keep it under 250 words
8. Be savage but not mean-spirited - it's all in good fun

Format:
[Roast text]

DEGEN SCORE: X/10

Go!`;
}

module.exports = { roastWallet };
