const express = require('express');
const app = express();
//const port = 8080;
//const request = require('request');
const { DateTime , Duration } = require('luxon');
const axios = require('axios');
const cors = require('cors');
let dayjs = require('dayjs');
require('dotenv').config();
const FinnhubKey = process.env.FINNHUB_KEY;
const Polygonkey = process.env.POLYGON_KEY;

app.use(cors());

const port = parseInt(process.env.PORT) || 8080;
const path = require('path');

app.get('/companyDescript/:ticker', async function (req, res) {
    try {
        const { ticker } = req.params;
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.use(express.static(path.join(__dirname, 'dist/frontend')));
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});




app.get('/companyDesc', async function (req, res) {
    try {
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/historicalChart/:ticker', async (req, res) => {
    try {
        // Main Chart
      const { ticker } = req.params;
      const twoYearsAgo = DateTime.now().minus({ years: 2 }).toISODate(); // 2 years ago
      const today = DateTime.now().toISODate();
      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${twoYearsAgo}/${today}?adjusted=true&sort=asc&apiKey=${Polygonkey}`);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



app.get('/companyHourly/:ticker', async (req, res) => {
    try {
      const { ticker } = req.params;
      const nowInPDT = DateTime.now().setZone('America/Los_Angeles');
  
      const marketOpenTime = nowInPDT.set({ hour: 6, minute: 30, second: 0 });
      const marketCloseTime = nowInPDT.set({ hour: 13, minute: 0, second: 0 });
  
      let startDate, endDate;
      const isWeekend = nowInPDT.weekday === 6 || nowInPDT.weekday === 7;
  
      if (!isWeekend && nowInPDT >= marketOpenTime && nowInPDT <= marketCloseTime) {
        // Market is open and today is a weekday
        startDate = DateTime.now().minus({ days: 1 }).toISODate();
        endDate = DateTime.now().toISODate();
      } else {
        // Market is closed or it's a weekend
        if (nowInPDT < marketOpenTime || isWeekend) {
          // Before market opens or today is a weekend
          // Adjust for weekends: If today is Saturday or Sunday, adjust startDate and endDate accordingly
          const adjustForWeekend = isWeekend ? (nowInPDT.weekday === 7 ? 2 : 1) : 0;
          startDate = DateTime.now().minus({ days: 2 + adjustForWeekend }).toISODate();
          endDate = DateTime.now().minus({ days: 1 + adjustForWeekend }).toISODate();
        } else {
          // After market closes
          startDate = DateTime.now().minus({ days: 1 }).toISODate();
          endDate = DateTime.now().toISODate();
        }
      }
  
      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${Polygonkey}`);
      const data = response.data;
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



app.get('/stockPrice', async function (req, res) {
    try {
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/autoComplete', async function (req, res) {
    try {
        const { queryVal } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/search?q=${queryVal}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/companyNews', async function (req, res) {
    let fromDate = '';
    let toDate = '';

    toDate = dayjs();
    fromDate = toDate.subtract(7, 'days');
    toDate = toDate.format("YYYY-MM-DD");
    fromDate = fromDate.format("YYYY-MM-DD")


    try{
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${FinnhubKey}`)
        // console.log(response)
        console.log('newsData',response.data);
        res.send(response.data);
        }catch(error){
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
});


app.get('/recommendation', async function (req, res) {
    try {
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/insiderSentiment/:ticker', async function (req, res) {

    try {
        let fromDate = '';
        let toDate = '';
        fromDate = '2022-01-01';
        toDate = DateTime.now().toISODate();
        const { ticker } = req.params;
        const response =  await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${FinnhubKey}`);
        res.send(response.data);
      
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/companyPeers', async function (req, res) {
    try {
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/companyEarnings', async function (req, res) {
    try {
        const { ticker } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${FinnhubKey}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(express.static(path.join(__dirname, 'dist/frontend')));
app.get('*', (req, res) => {

    res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
