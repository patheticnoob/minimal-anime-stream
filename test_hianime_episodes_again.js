import { Hianime } from "hianime";
const client = new Hianime();
async function test() {
  try {
    const episodes = await client.getEpisodes("frieren-beyond-journeys-end-season-2-20409");
    console.log(JSON.stringify(episodes, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
