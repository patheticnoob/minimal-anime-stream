const fetch = require('node-fetch');

async function check() {
  try {
    const response = await fetch('https://yumaapi.vercel.app/recent-episodes?page=1');
    const data = await response.json();
    console.log(JSON.stringify(data.results[0], null, 2));
    console.log(JSON.stringify(data.results[1], null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
