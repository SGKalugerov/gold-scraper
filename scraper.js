const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const dataFilePath = path.join(__dirname, 'data.json');

async function scrapeData() {
  const url = 'https://funpay.com/en/chips/114/';
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const servers = [
    "(EU) #Season of Discovery - Living Flame",
    "(EU) #Season of Discovery - Lone Wolf",
    "(EU) #Season of Discovery - Wild Growth"
  ];

  const lowestPrices = {};

  $('.tc-item').each((index, element) => {
    const server = $(element).find('.tc-server').text().trim();
    const side = $(element).find('.tc-side').text().trim();
    const price = $(element).find('.tc-price div').text().trim().replace('€', '').trim();

    if (side === "Horde" && servers.includes(server)) {
      if (!lowestPrices[server] || parseFloat(price) < parseFloat(lowestPrices[server])) {
        lowestPrices[server] = parseFloat(price);
      }
    }
  });

  return lowestPrices;
}

function saveData(data) {
  let existingData = [];
  if (fs.existsSync(dataFilePath)) {
    existingData = JSON.parse(fs.readFileSync(dataFilePath));
  }

  const timestamp = new Date().toISOString();
  existingData.push({ timestamp, data });

  fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));
}

async function scheduledScrape() {
  try {
    const data = await scrapeData();
    saveData(data);
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

cron.schedule('*/10 * * * *', scheduledScrape);

scheduledScrape();

module.exports = { scrapeData };