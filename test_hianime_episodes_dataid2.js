import { Hianime } from "hianime";

async function test() {
  try {
    const hianime = new Hianime();
    const dataId = "20409";
    const episodes = await hianime.getEpisodes(dataId);
    console.log(JSON.stringify(episodes, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
