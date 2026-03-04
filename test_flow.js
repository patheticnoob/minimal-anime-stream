import { Hianime } from "hianime";

async function test() {
  try {
    const gojoId = "frieren-beyond-journeys-end-season-2-20409";
    
    // 1. Get details from Gojo API to get the title
    const gojoRes = await fetch(`https://gojoback.zeabur.app/api/v1/anime/${gojoId}`);
    const gojoData = await gojoRes.json();
    const title = gojoData.data.title;
    console.log("Gojo Title:", title);

    // 2. Search HiAnime using the title
    const hianime = new Hianime();
    const searchRes = await hianime.search(title, 1);
    
    if (!searchRes.animes || searchRes.animes.length === 0) {
      console.log("No results found in HiAnime for title:", title);
      return;
    }

    const hianimeId = searchRes.animes[0].id;
    console.log("HiAnime ID:", hianimeId);

    // 3. Fetch episodes using HiAnime ID
    const episodes = await hianime.getEpisodes(hianimeId);
    console.log("HiAnime Episodes count:", episodes.episodes.length);
    console.log("First episode:", episodes.episodes[0]);

    // 4. Fetch servers for the first episode
    const firstEpId = episodes.episodes[0].episodeId;
    const servers = await hianime.getEpisodeServers(firstEpId);
    console.log("Servers for first episode:", JSON.stringify(servers, null, 2));

  } catch (e) {
    console.error(e);
  }
}
test();
