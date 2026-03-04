import { Hianime } from 'hianime';

async function main() {
  const client = new Hianime();
  try {
    const episodes = await client.getEpisodes("20409");
    console.log(JSON.stringify(episodes, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
