/* ==========================================================
   MOCK MOVIE DATA
   Used when USE_MOCK_DATA = true in config.js (e.g. before
   you've grabbed your OMDb + YouTube API keys).
   Poster images are simple placeholders and every "trailer"
   points to an openly-licensed sample video (Blender
   Foundation's "Big Buck Bunny") as a stand-in.
   ========================================================== */

const PLACEHOLDER_TRAILER_KEY = "aqz-KE-bpKQ"; // Big Buck Bunny (CC-licensed sample)

function placeholderPoster(title) {
    return `https://placehold.co/342x513/1a1a1c/e10600?text=${encodeURIComponent(title)}`;
}

const MOCK_TITLES = [
    { title: "Crimson Horizon", year: "2024", rating: "8.1", category: "action", overview: "A stranded pilot must cross a hostile frontier to warn a city of an incoming storm unlike any other." },
    { title: "The Last Ledger", year: "2023", rating: "7.4", category: "toprated", overview: "An auditor uncovers a decades-old fraud that reaches the very people who hired her to find it." },
    { title: "Paper Moons", year: "2022", rating: "7.8", category: "comedy", overview: "Two rival street performers fall for each other while competing for the same stage." },
    { title: "Nightshade Manor", year: "2024", rating: "6.9", category: "horror", overview: "A family inherits a house that remembers everyone who has ever lived in it." },
    { title: "Iron Tide", year: "2021", rating: "7.6", category: "action", overview: "A retired diver is pulled back into a world of smuggling when her old crew resurfaces." },
    { title: "Comet Season", year: "2023", rating: "8.3", category: "romance", overview: "Two strangers spend one summer on a dying orchard, waiting for a comet only one of them believes in." },
    { title: "Static & Bone", year: "2020", rating: "7.0", category: "horror", overview: "A radio host starts receiving broadcasts from a station that stopped operating forty years ago." },
    { title: "The Understudy", year: "2022", rating: "7.2", category: "comedy", overview: "A backup actor gets his one shot at the lead role — on the night everything goes wrong." },
    { title: "Glass Orchard", year: "2024", rating: "8.0", category: "toprated", overview: "A vineyard owner and her estranged son must decide the future of the land that raised them both." },
    { title: "Midnight Cartographer", year: "2021", rating: "7.5", category: "action", overview: "A map-maker discovers a route that shouldn't exist, and someone willing to kill to keep it hidden." },
    { title: "Salt & Static", year: "2023", rating: "6.8", category: "horror", overview: "A coastal town loses power every night at the same hour, and no one will say why." },
    { title: "The Rehearsal Dinner", year: "2022", rating: "7.1", category: "romance", overview: "A wedding weekend unravels when the best man's ex turns out to be the wedding planner." },
    { title: "Hollow Meridian", year: "2024", rating: "7.9", category: "trending", overview: "A cartography drone finds a canyon that isn't on any satellite map — or any calendar." },
    { title: "Low Tide Lullaby", year: "2020", rating: "7.3", category: "toprated", overview: "A lighthouse keeper's daughter returns home to settle an inheritance she never wanted." },
    { title: "Counterfeit Hearts", year: "2023", rating: "6.7", category: "romance", overview: "Two con artists posing as a married couple start to forget which parts of the act are real." },
    { title: "The Quiet Ward", year: "2021", rating: "7.6", category: "horror", overview: "A night-shift nurse notices the hospital's newest patient hasn't aged in the security footage." },
    { title: "Redline Aria", year: "2024", rating: "7.7", category: "trending", overview: "A disgraced racer gets one last shot at redemption on a track that's killed three of her friends." },
    { title: "The Founders' Table", year: "2022", rating: "8.2", category: "trending", overview: "Five co-founders reunite a decade after their startup's collapse to finally settle what went wrong." },
];

const MOCK_MOVIES = MOCK_TITLES.map((m, i) => ({
    id: `mock-${i + 1}`,
    title: m.title,
    overview: m.overview,
    poster: placeholderPoster(m.title),
    rating: m.rating,
    year: m.year,
    category: m.category,
    trailerKey: PLACEHOLDER_TRAILER_KEY,
}));