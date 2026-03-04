import hianime from "hianime";
const client = new hianime.Hianime();
async function test() {
  try {
    const res = await client.getEpisodeServers("frieren-beyond-journeys-end-season-2-20409?ep=163517");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
