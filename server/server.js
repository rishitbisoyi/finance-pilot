const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

/*
==================================================
DATABASE + SESSION
==================================================
*/

let users = {};
let currentUser = null;

/*
==================================================
GLOBAL MARKET (AUTO UPDATING)
==================================================
*/

let market = {
  FD: { price: 100, history: [] },
  Gold: { price: 5000, history: [] },
  Stocks: { price: 1000, history: [] },
  Crypto: { price: 20000, history: [] }
};

// Initialize history
for (let asset in market) {
  market[asset].history.push({
    price: market[asset].price,
    date: new Date()
  });
}

/*
==================================================
AUTO MARKET UPDATE (Every 10 seconds)
==================================================
*/

setInterval(() => {
  for (let asset in market) {
    let changeRate = 0;

    if (asset === "FD") changeRate = 0.005; // +0.5% stable growth
    else if (asset === "Gold") changeRate = Math.random() * 0.02 - 0.01;
    else if (asset === "Stocks") changeRate = Math.random() * 0.06 - 0.03;
    else if (asset === "Crypto") changeRate = Math.random() * 0.10 - 0.05;

    market[asset].price *= (1 + changeRate);

    market[asset].price = Number(market[asset].price.toFixed(2));

    market[asset].history.push({
      price: market[asset].price,
      date: new Date()
    });

    // Keep only last 50 history entries
    if (market[asset].history.length > 50) {
      market[asset].history.shift();
    }
  }

  console.log("Market Updated");
}, 10000);

/*
==================================================
AUTH
==================================================
*/

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (users[username])
    return res.status(400).json({ error: "Username exists" });

  users[username] = {
    password,
    cash: 10000,
    holdings: { FD: 0, Gold: 0, Stocks: 0, Crypto: 0 },
    transactions: []
  };

  res.json({ message: "User created" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];

  if (!user || user.password !== password)
    return res.status(400).json({ error: "Invalid credentials" });

  currentUser = username;

  res.json({ message: `Logged in as ${username}` });
});

app.post("/logout", (req, res) => {
  currentUser = null;
  res.json({ message: "Logged out" });
});

/*
==================================================
BUY
==================================================
*/

app.post("/buy", (req, res) => {
  if (!currentUser)
    return res.status(401).json({ error: "No user logged in" });

  const { asset, qty } = req.body;
  const quantity = Number(qty);

  if (!market[asset])
    return res.status(400).json({ error: "Invalid asset" });

  if (!quantity || quantity <= 0)
    return res.status(400).json({ error: "Invalid quantity" });

  const user = users[currentUser];
  const price = market[asset].price;
  const totalCost = price * quantity;

  if (totalCost > user.cash)
    return res.status(400).json({ error: "Insufficient cash" });

  user.cash -= totalCost;
  user.cash = Number(user.cash.toFixed(2));

  user.holdings[asset] += quantity;

  user.transactions.push({
    type: "BUY",
    asset,
    qty: quantity,
    price,
    date: new Date()
  });

  res.json({
    message: "Asset purchased",
    asset,
    qty: quantity,
    price,
    remainingCash: user.cash
  });
});

/*
==================================================
SELL
==================================================
*/

app.post("/sell", (req, res) => {
  if (!currentUser)
    return res.status(401).json({ error: "No user logged in" });

  const { asset, qty } = req.body;
  const quantity = Number(qty);

  if (!market[asset])
    return res.status(400).json({ error: "Invalid asset" });

  const user = users[currentUser];

  if (quantity <= 0 || quantity > user.holdings[asset])
    return res.status(400).json({ error: "Not enough holdings" });

  const price = market[asset].price;
  const totalValue = price * quantity;

  user.cash += totalValue;
  user.cash = Number(user.cash.toFixed(2));

  user.holdings[asset] -= quantity;

  user.transactions.push({
    type: "SELL",
    asset,
    qty: quantity,
    price,
    date: new Date()
  });

  res.json({
    message: "Asset sold",
    asset,
    qty: quantity,
    price,
    cash: user.cash
  });
});

/*
==================================================
PORTFOLIO
==================================================
*/

app.get("/portfolio", (req, res) => {
  if (!currentUser)
    return res.status(401).json({ error: "No user logged in" });

  const user = users[currentUser];

  let holdingsValue = 0;

  for (let asset in user.holdings) {
    holdingsValue += user.holdings[asset] * market[asset].price;
  }

  holdingsValue = Number(holdingsValue.toFixed(2));
  const netWorth = Number((user.cash + holdingsValue).toFixed(2));

  res.json({
    user: currentUser,
    cash: user.cash,
    holdings: user.holdings,
    holdingsValue,
    netWorth,
    transactions: user.transactions
  });
});

/*
==================================================
MARKET
==================================================
*/

app.get("/market", (req, res) => {
  let prices = {};
  for (let asset in market) {
    prices[asset] = market[asset].price;
  }
  res.json(prices);
});

app.get("/market-history/:asset", (req, res) => {
  const asset = req.params.asset;

  if (!market[asset])
    return res.status(400).json({ error: "Invalid asset" });

  res.json(market[asset].history);
});

/*
==================================================
ROOT
==================================================
*/

app.get("/", (req, res) => {
  res.send("Trading Simulator Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
