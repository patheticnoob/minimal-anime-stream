import { Hianime } from 'hianime';

async function main() {
  const client = new Hianime();
  try {
    const searchResults = await client.search("Frieren: Beyond Journey's End Season 2");
    console.log(JSON.stringify(searchResults.animes[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
