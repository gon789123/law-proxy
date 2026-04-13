const express = require('express');
const fetch = require('node-fetch');
const app = express();

const OC = 'sh123';
const LAW_ID = process.env.LAW_ID;
const LAW_PW = process.env.LAW_PASSWORD;

let sessionCookie = '';

async function login() {
  try {
    const res = await fetch('https://law.go.kr/LSO/memberAuth.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://law.go.kr'
      },
      body: `loginId=${encodeURIComponent(LAW_ID)}&loginPwd=${encodeURIComponent(LAW_PW)}&loginFlag=login`,
      redirect: 'manual'
    });

    const cookies = res.headers.raw()['set-cookie'];
    if (cookies) {
      sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
      console.log('로그인 성공');
    } else {
      console.log('로그인 실패 - 쿠키 없음');
    }
  } catch (err) {
    console.log('로그인 오류:', err);
  }
}

app.get('/law', async (req, res) => {
  if (!sessionCookie) await login();

  const query = req.query.query || '절도';
  const url = `https://law.go.kr/DRF/lawSearch.do?OC=${OC}&target=prec&type=JSON&query=${encodeURIComponent(query)}&display=3`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://law.go.kr',
        'Cookie': sessionCookie
      }
    });

    const text = await response.text();
    console.log('law.go.kr 응답:', text.substring(0, 200));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(text);

  } catch (err) {
    console.log('오류:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(process.env.PORT || 3000, async () => {
  console.log('서버 실행중');
  await login();
});
