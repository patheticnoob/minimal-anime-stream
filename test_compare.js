const https = require('https');

async function fetchGojoHome() {
  return new Promise((resolve, reject) => {
    https.get('https://gojoback.zeabur.app/api/v1/home', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const gojoHome = await fetchGojoHome();
    console.log("Gojo Spotlight First Item:");
    console.log(JSON.stringify(gojoHome.data.spotlightEpisodes[0], null, 2));
    
    console.log("\nGojo Trending First Item:");
    console.log(JSON.stringify(gojoHome.data.trendingEpisodes[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
