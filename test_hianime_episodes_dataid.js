import { Hianime } from "hianime";

async function test() {
  try {
    const hianime = new Hianime();
    const gojoId = "frieren-beyond-journeys-end-season-2-20409";
    const dataId = gojoId.split('-').pop();
    console.log("Extracted dataId:", dataId);
    
    const episodes = await hianime.getEpisodes(dataId);
    console.log("Episodes count:", episodes.episodes.length);
    console.log("First episode:", episodes.episodes[0]);
  } catch (e) {
    console.error(e);
  }
}
test();
