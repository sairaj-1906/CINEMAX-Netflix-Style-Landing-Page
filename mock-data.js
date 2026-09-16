/* ==========================================================
   MOCK MOVIE DATA
   Used when USE_MOCK_DATA = true in config.js (e.g. while
   TMDB is unreachable, or while you're just building the UI).
   Poster/backdrop images are simple placeholders — swap
   USE_MOCK_DATA to false and add your API key for real posters,
   trailers and search results.
   Trailer key points to an openly-licensed sample video
   (Blender Foundation's "Big Buck Bunny") as a stand-in trailer.
   ========================================================== */

const PLACEHOLDER_TRAILER_KEY = "aqz-KE-bpKQ"; // Big Buck Bunny (CC-licensed sample)

function placeholderPoster(title) {
    return `https://placehold.co/342x513/1a1a1c/e10600?text=${encodeURIComponent(title)}`;
}
function placeholderBackdrop(title) {
    return `https://placehold.co/1280x720/0b0b0c/e10600?text=${encodeURIComponent(title)}`;
}

const MOCK_TITLES = [
    { title: "Crimson Horizon", year: "2024", rating: 8.1, genres: [28, 12], overview: "A stranded pilot must cross a hostile frontier to warn a city of an incoming storm unlike any other." },
    { title: "The Last Ledger", year: "2023", rating: 7.4, genres: [53, 18], overview: "An auditor uncovers a decades-old fraud that reaches the very people who hired her to find it." },
    { title: "Paper Moons", year: "2022", rating: 7.8, genres: [35, 10749], overview: "Two rival street performers fall for each other while competing for the same stage." },
    { title: "Nightshade Manor", year: "2024", rating: 6.9, genres: [27], overview: "A family inherits a house that remembers everyone who has ever lived in it." },
    { title: "Iron Tide", year: "2021", rating: 7.6, genres: [28, 53], overview: "A retired diver is pulled back into a world of smuggling when her old crew resurfaces." },
    { title: "Comet Season", year: "2023", rating: 8.3, genres: [18, 10749], overview: "Two strangers spend one summer on a dying orchard, waiting for a comet only one of them believes in." },
    { title: "Static & Bone", year: "2020", rating: 7.0, genres: [27, 53], overview: "A radio host starts receiving broadcasts from a station that stopped operating forty years ago." },
    { title: "The Understudy", year: "2022", rating: 7.2, genres: [35, 18], overview: "A backup actor gets his one shot at the lead role — on the night everything goes wrong." },
    { title: "Glass Orchard", year: "2024", rating: 8.0, genres: [18], overview: "A vineyard owner and her estranged son must decide the future of the land that raised them both." },
    { title: "Midnight Cartographer", year: "2021", rating: 7.5, genres: [12, 28], overview: "A map-maker discovers a route that shouldn't exist, and someone willing to kill to keep it hidden." },
    { title: "Salt & Static", year: "2023", rating: 6.8, genres: [27, 9648], overview: "A coastal town loses power every night at the same hour, and no one will say why." },
    { title: "The Rehearsal Dinner", year: "2022", rating: 7.1, genres: [35, 10749], overview: "A wedding weekend unravels when the best man's ex turns out to be the wedding planner." },
    { title: "Hollow Meridian", year: "2024", rating: 7.9, genres: [28, 12], overview: "A cartography drone finds a canyon that isn't on any satellite map — or any calendar." },
    { title: "Low Tide Lullaby", year: "2020", rating: 7.3, genres: [18], overview: "A lighthouse keeper's daughter returns home to settle an inheritance she never wanted." },
    { title: "Counterfeit Hearts", year: "2023", rating: 6.7, genres: [35, 10749], overview: "Two con artists posing as a married couple start to forget which parts of the act are real." },
    { title: "The Quiet Ward", year: "2021", rating: 7.6, genres: [27, 9648], overview: "A night-shift nurse notices the hospital's newest patient hasn't aged in the security footage." },
];

const MOCK_MOVIES = MOCK_TITLES.map((m, i) => ({
    id: `mock-${i + 1}`,
    title: m.title,
    overview: m.overview,
    poster_path: placeholderPoster(m.title),
    backdrop_path: placeholderBackdrop(m.title),
    vote_average: m.rating,
    release_date: `${m.year}-01-01`,
    genre_ids: m.genres,
    trailer_key: PLACEHOLDER_TRAILER_KEY,
}));