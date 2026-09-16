// ============================================
// 1. Go to https://www.themoviedb.org/signup
// 2. Confirm your email, then go to
//    Settings -> API -> Create -> Developer
// 3. Copy the "API Read Access Token" (starts with "eyJ...")
//    (NOT the short API key — use the long v4 Read Access Token)
// 4. Paste it below between the quotes.
// 5. Set USE_MOCK_DATA to false once your key is in and TMDB
//    is reachable again.
// ============================================

const TMDB_ACCESS_TOKEN = "PASTE_YOUR_TMDB_READ_ACCESS_TOKEN_HERE";

// While true, the app uses local sample movie data instead of
// calling TMDB — handy for building/testing the UI while TMDB
// is unreachable, or before you've grabbed an API key.
const USE_MOCK_DATA = true;