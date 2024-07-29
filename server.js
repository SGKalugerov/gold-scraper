const express = require('express');
const fs = require('fs');
const path = require('path');
const { scrapeData } = require('./scraper');

const app = express();
const PORT = 3069;

app.use(express.static('public'));

app.get('/data', (req, res) => {
  const dataFilePath = path.join(__dirname, 'data.json');
  if (!fs.existsSync(dataFilePath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(dataFilePath));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});