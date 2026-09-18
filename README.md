# CINEMAX — Netflix-style Landing Page + Movie Search

Built with plain HTML, CSS, JavaScript, Bootstrap 5, and Tailwind CSS. Movie data comes from [OMDb API](https://www.omdbapi.com/), and trailers are located via the [YouTube Data API](https://developers.google.com/youtube/v3).

> **Why not TMDB?** TMDB is blocked by several major Indian ISPs (it was mistakenly flagged as a piracy site by a regulatory directive a while back, and access issues resurface on and off). OMDb + YouTube are both reliably reachable in India.

## Features
- Auto-rotating hero banner pulling a random featured title
- Horizontally scrolling category rows (Trending, Popular, Top Rated, and genre rows) — built from curated title lists, since OMDb doesn't offer a "browse by trending/genre" endpoint the way TMDB did
- Live search with debounced input and a dropdown of results
- Trailer popup (Bootstrap modal + embedded YouTube trailer, found by searching "`<title>` official trailer")
- Fully responsive (mobile menu, flexible rows, fluid hero)
- Animations: hero fade/rise-in on load, card hover scale + info overlay, shimmer loading skeletons, navbar blur-on-scroll

## Try it right now with sample data
The app ships with `USE_MOCK_DATA = true` in `js/config.js`, so it runs immediately with a small local sample dataset (`js/mock-data.js`) — no API keys or internet dependency needed. Posters are simple placeholder images and every "trailer" points to the same openly-licensed sample video, but every feature (search, categories, hover states, trailer popup, animations) is fully working.

## Switching to real movie data (needs 2 free keys)

### 1. OMDb API key
1. Go to https://www.omdbapi.com/apikey.aspx
2. Choose the **FREE** tier, enter your email
3. Check your inbox for an activation link and click it
4. Your key arrives by email

### 2. YouTube Data API key
1. Go to https://console.cloud.google.com/
2. Create a new project (any name)
3. Go to **APIs & Services → Library**, search **"YouTube Data API v3"**, click **Enable**
4. Go to **APIs & Services → Credentials → Create Credentials → API key**, copy it

### 3. Plug them in
Open `js/config.js` and update:
```js
const OMDB_API_KEY = "your-omdb-key-here";
const YOUTUBE_API_KEY = "your-youtube-key-here";
const USE_MOCK_DATA = false;
```

### 4. Run it
Open `index.html` in a browser (or serve the folder — some browsers block `fetch` on `file://`, so if the rows don't load, run a tiny local server, e.g. `npx serve .` or VS Code's "Live Server" extension).

## File structure
```
netflix-clone/
├── index.html
├── css/style.css
├── js/config.js       ← your API keys go here
├── js/mock-data.js
├── js/app.js
└── README.md
```

## Customizing for your portfolio
- Swap the "CINEMAX" name/logo in `index.html`'s nav for your own brand.
- Category rows are driven by `CATEGORY_TITLES` near the top of `js/app.js` — just edit the arrays of movie titles under each key (`trending`, `popular`, `toprated`, `action`, `comedy`, `horror`, `romance`) to whatever films you want featured.
- Colors and fonts are defined in the Tailwind config block in `index.html` and in `css/style.css` — the palette is Netflix's own charcoal/crimson, which you can retint to make it clearly "yours."

## Known limitations (OMDb vs TMDB trade-offs)
- No true "trending"/"popular" data — rows are curated lists you control, not live rankings.
- Hero and card images use OMDb's portrait poster (no widescreen backdrop image is provided), so the hero banner uses a blurred/darkened poster as its background instead of a proper cinematic backdrop.
- OMDb's free tier allows 1,000 requests/day — each row load costs roughly one request per title, so keep row sizes modest (8–10 titles) if you're testing a lot.