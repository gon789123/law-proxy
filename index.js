const express = require('express');
const fetch = require('node-fetch');
const app = express();

const OC = 'sh123'; // 실제 OC값으로 교체

app.get('/law', async (req, res) => {
  const query = req.query.query || '절도';
  const url = `https://law.go.kr/DRF/lawSearch.do?OC=${OC}&target=prec&type=JSON&query=${encodeURIComponent(query)}&display=3`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행중');
});
