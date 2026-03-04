import { Hianime } from 'hianime';

async function main() {
  const client = new Hianime();
  try {
    console.log("Testing with just ID 163517:");
    const servers1 = await client.getEpisodeServers("163517");
    console.log(JSON.stringify(servers1, null, 2));
  } catch (e) {
    console.error("Failed with just ID:", e.message);
  }

  try {
    console.log("\nTesting with full href:");
    const servers2 = await client.getEpisodeServers("frieren-beyond-journeys-end-season-2-20409?ep=163517");
    console.log(JSON.stringify(servers2, null, 2));
  } catch (e) {
    console.error("Failed with full href:", e.message);
  }
}

main();
