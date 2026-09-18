// ============================================
// This app now uses TWO free APIs instead of TMDB
// (TMDB is blocked by several Indian ISPs).
//
// 1) OMDb API — movie data (poster, plot, rating)
//    - Go to https://www.omdbapi.com/apikey.aspx
//    - Choose the FREE tier, enter your email
//    - Check your inbox for the activation link, click it
//    - Your key arrives by email — paste it below
//
// 2) YouTube Data API — powers the trailer popup by
//    searching "<movie title> official trailer" on demand
//    - Go to https://console.cloud.google.com/
//    - Create a project (any name)
//    - Go to "APIs & Services" -> "Library" -> search
//      "YouTube Data API v3" -> Enable
//    - Go to "APIs & Services" -> "Credentials" -> "Create
//      Credentials" -> "API key" -> copy it
// ============================================

const OMDB_API_KEY = "ADD_YOUR_OMDB_API_KEY";
const YOUTUBE_API_KEY = "ADD_YOUR_YOUTUBE_API_KEY";

// While true, the app uses local sample movie data instead of
// calling any API — handy for building/testing the UI before
// you've grabbed both keys above.
const USE_MOCK_DATA = false;