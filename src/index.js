require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { roastWallet } = require('./roaster');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Wallet-Roast' });
});

// Main endpoint - roast a wallet
app.post('/api/roast', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Clean the address (remove Solscan URL if pasted)
    const cleanAddress = address
      .replace('https://solscan.io/account/', '')
      .replace('https://explorer.solana.com/address/', '')
      .trim();

    const result = await roastWallet(cleanAddress);
    res.json(result);
  } catch (error) {
    console.error('Roast error:', error);
    res.status(500).json({ error: error.message || 'Failed to roast wallet' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Wallet-Roast running on http://localhost:${PORT}`);
});
