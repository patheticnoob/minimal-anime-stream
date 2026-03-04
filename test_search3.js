import { Hianime } from "hianime";

async function test() {
  try {
    const hianime = new Hianime();
    const searchRes = await hianime.search("Frieren", 1);
    console.log(JSON.stringify(searchRes, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
