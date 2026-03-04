import { Hianime } from "hianime";
const client = new Hianime();
async function test() {
  try {
    const res = await client.getEpisodeSources("1403973");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
