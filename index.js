const express = require('express');
const fetch = require('node-fetch');
const app = express();

const OC = 'sh123';
const LAW_ID = process.env.LAW_ID;
const LAW_PW = process.env.LAW_PASSWORD;

let sessionCookie = '';

async function login() {
  try {
    const res = await fetch('https://open.law.go.kr/LSO/execLogin.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://open.law.go.kr/LSO/login.do',
        'Origin': 'https://open.law.go.kr',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: `usrId=${encodeURIComponent(LAW_ID)}&pw=${encodeURIComponent(LAW_PW)}`,
      redirect: 'manual'
    });

    const cookies = res.headers.raw()['set-cookie'];
    const text = await res.text();
    console.log('로그인 응답:', text);

    if (cookies) {
      sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
      console.log('쿠키 저장 완료');
    }

    if (text === '1') {
      console.log('로그인 성공!');
    } else {
      console.log('로그인 실패, 응답:', text);
    }

  } catch (err) {
    console.log('로그인 오류:', err);
  }
}

// ← 이 부분이 빠져있었어요!
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
