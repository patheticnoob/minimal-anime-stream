import { Hianime } from 'hianime';

async function main() {
  const client = new Hianime();
  try {
    console.log("Testing with full ID:");
    const episodes = await client.getEpisodes("frieren-beyond-journeys-end-season-2-20409");
    console.log(JSON.stringify(episodes, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
