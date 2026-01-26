# GojoStream Data Export Format

This document describes the JSON format used for exporting and importing user data in GojoStream.

## Export File Format

The export file is a JSON file with the following structure:

```json
{
  "version": "1.0.0",
  "exportDate": "2025-01-26T12:34:56.789Z",
  "userData": {
    "name": "User Name",
    "email": "user@example.com",
    "theme": "classic",
    "dataFlow": "v1"
  },
  "watchlist": [
    {
      "animeId": "anime-unique-id",
      "animeTitle": "Anime Title",
      "animeImage": "https://example.com/image.jpg",
      "animeType": "TV",
      "language": {
        "sub": "language-id-sub",
        "dub": "language-id-dub"
      },
      "addedAt": 1706270096789
    }
  ],
  "watchProgress": [
    {
      "animeId": "anime-unique-id",
      "animeTitle": "Anime Title",
      "animeImage": "https://example.com/image.jpg",
      "episodeId": "episode-unique-id",
      "episodeNumber": 5,
      "currentTime": 325.5,
      "duration": 1440,
      "language": {
        "sub": "language-id-sub",
        "dub": "language-id-dub"
      },
      "lastWatched": 1706270096789
    }
  ],
  "stats": {
    "totalWatchlistItems": 10,
    "totalProgressItems": 15
  }
}
```

## Field Descriptions

### Root Level
- `version` (string): Format version for compatibility checking
- `exportDate` (string): ISO 8601 timestamp of when the export was created
- `userData` (object): User preferences and settings
- `watchlist` (array): List of anime in the user's watchlist
- `watchProgress` (array): List of anime with watch progress
- `stats` (object): Summary statistics

### userData Object
- `name` (string, optional): User's display name
- `email` (string, optional): User's email address
- `theme` (string, optional): Selected theme (classic, retro, nothing)
- `dataFlow` (string, optional): Selected API version (v1, v2, v3, v4)

### watchlist Array Items
- `animeId` (string): Unique identifier for the anime
- `animeTitle` (string): Title of the anime
- `animeImage` (string, optional): URL to anime poster/thumbnail
- `animeType` (string, optional): Type of anime (TV, Movie, OVA, etc.)
- `language` (object, optional): Language preferences
  - `sub` (string, optional): Subtitle language identifier
  - `dub` (string, optional): Dub language identifier
- `addedAt` (number): Unix timestamp (milliseconds) when added to watchlist

### watchProgress Array Items
- `animeId` (string): Unique identifier for the anime
- `animeTitle` (string): Title of the anime
- `animeImage` (string, optional): URL to anime poster/thumbnail
- `episodeId` (string): Unique identifier for the episode
- `episodeNumber` (number): Episode number
- `currentTime` (number): Current playback position in seconds
- `duration` (number): Total duration of the episode in seconds
- `language` (object, optional): Language preferences used for this viewing
  - `sub` (string, optional): Subtitle language identifier
  - `dub` (string, optional): Dub language identifier
- `lastWatched` (number): Unix timestamp (milliseconds) of last viewing

### stats Object
- `totalWatchlistItems` (number): Count of items in watchlist
- `totalProgressItems` (number): Count of items with progress

## Import Modes

### Merge Mode
- Adds imported data to existing data
- Skips items that already exist (based on animeId)
- Preserves all existing data

### Replace Mode
- Deletes all existing watchlist and progress data
- Imports all data from the file
- Updates existing progress items if they match animeId

## Usage in Other Projects

This format is designed to be portable and can be used in other anime streaming projects. Key considerations:

1. **animeId Mapping**: You may need to map `animeId` values to your own database identifiers
2. **language Object**: The language identifiers may be specific to your API
3. **Timestamps**: All timestamps are in Unix milliseconds (JavaScript Date.now() format)
4. **Optional Fields**: Many fields are optional to allow for flexibility across different implementations

## Example Usage

### Exporting Data
Click the "Export Data" button in the profile page to download a JSON file with all your data.

### Importing Data
1. Click the "Import Data" button in the profile page
2. Select your JSON export file
3. Choose import mode:
   - **Merge**: Add to existing data (recommended)
   - **Replace**: Clear all data and import (use with caution)
4. Confirm the import

## Version History

- **1.0.0** (2025-01-26): Initial format specification
  - Basic watchlist and progress export
  - User preferences included
  - Merge and replace import modes
