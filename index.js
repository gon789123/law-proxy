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

app.listen(process.env.PORT || 3000, async () => {
  console.log('서버 실행중');
  await login();
});
