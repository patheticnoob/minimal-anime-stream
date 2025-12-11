# 1. Get recent episodes
curl "https://yumaapi.vercel.app/recent-episodes?page=1" | jq '.results[0]'

# 2. Check what ID format you get
# Expected: {"id": "some-anime-episode-123", ...}

# 3. Test if the extracted ID works with hianime
# (You'd need to test this with your hianime API endpoint)