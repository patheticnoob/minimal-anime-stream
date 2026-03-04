import { Hianime } from 'hianime';

async function main() {
  const client = new Hianime();
  try {
    const searchResults = await client.search("Frieren");
    console.log(JSON.stringify(searchResults, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
