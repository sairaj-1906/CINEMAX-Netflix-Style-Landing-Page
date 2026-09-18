/* ==========================================================
   CINEMAX — Netflix-style landing page + movie search
   Data sources: OMDb API (movie data) + YouTube Data API
   (trailer search on demand). Chosen because TMDB is blocked
   by several Indian ISPs.
   ========================================================== */

const OMDB_BASE = "https://www.omdbapi.com/";
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3/search";

const hasValidKeys = () =>
    OMDB_API_KEY &&
    !OMDB_API_KEY.startsWith("PASTE_") &&
    YOUTUBE_API_KEY &&
    !YOUTUBE_API_KEY.startsWith("PASTE_");

/* ---------- Curated title lists ----------
   OMDb has no "trending" or "browse by genre" endpoint, only
   search-by-title. So each category row is a hand-picked list
   of real titles that gets looked up individually. Swap these
   out for any movies you like. */
const CATEGORY_TITLES = {
    trending: ["Oppenheimer", "Barbie", "Inception", "Interstellar", "Dune", "Whiplash", "La La Land", "Parasite"],
    popular: ["The Shawshank Redemption", "The Godfather", "Pulp Fiction", "Fight Club", "Forrest Gump", "The Matrix", "Gladiator", "Se7en"],
    toprated: ["The Godfather", "The Dark Knight", "12 Angry Men", "Schindler's List", "The Lord of the Rings: The Return of the King", "The Good, the Bad and the Ugly", "Fight Club", "The Departed"],
    action: ["Mad Max: Fury Road", "John Wick", "Mission: Impossible - Fallout", "Top Gun: Maverick", "Die Hard", "The Bourne Identity", "Raiders of the Lost Ark", "Skyfall"],
    comedy: ["Superbad", "The Hangover", "Bridesmaids", "Groundhog Day", "Anchorman", "Mean Girls", "Zombieland", "Knives Out"],
    horror: ["The Shining", "Get Out", "Hereditary", "A Quiet Place", "The Conjuring", "It", "The Exorcist", "Midsommar"],
    romance: ["The Notebook", "Titanic", "Pride & Prejudice", "La La Land", "Eternal Sunshine of the Spotless Mind", "Notting Hill", "About Time", "500 Days of Summer"],
};
const HERO_POOL = CATEGORY_TITLES.trending;

/* ---------- Fetch helpers ---------- */
async function omdbByTitle(title) {
    const url = new URL(OMDB_BASE);
    url.searchParams.set("apikey", OMDB_API_KEY);
    url.searchParams.set("t", title);
    url.searchParams.set("plot", "short");
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "False") return null;
    return normalizeOmdb(data);
}

async function omdbSearch(query) {
    const url = new URL(OMDB_BASE);
    url.searchParams.set("apikey", OMDB_API_KEY);
    url.searchParams.set("s", query);
    url.searchParams.set("type", "movie");
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "False") return [];
    return data.Search.map((m) => ({
        id: m.imdbID,
        title: m.Title,
        year: m.Year,
        poster: m.Poster && m.Poster !== "N/A" ? m.Poster : "",
        rating: null,
        overview: "",
    }));
}

async function youtubeTrailerKey(title) {
    const url = new URL(YOUTUBE_BASE);
    url.searchParams.set("key", YOUTUBE_API_KEY);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("q", `${title} official trailer`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube request failed: ${res.status}`);
    const data = await res.json();
    return data.items && data.items[0] ? data.items[0].id.videoId : null;
}

function normalizeOmdb(m) {
    return {
        id: m.imdbID,
        title: m.Title,
        year: m.Year,
        poster: m.Poster && m.Poster !== "N/A" ? m.Poster : "",
        rating: m.imdbRating && m.imdbRating !== "N/A" ? m.imdbRating : null,
        overview: m.Plot && m.Plot !== "N/A" ? m.Plot : "",
    };
}

/* ---------- Utilities ---------- */
function debounce(fn, delay = 350) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

/* ---------- Status banner ---------- */
function renderBanner(message) {
    const banner = document.createElement("div");
    banner.className =
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-crimson/95 text-white text-sm px-5 py-3 rounded-lg shadow-xl max-w-md text-center";
    banner.innerHTML = message;
    document.body.appendChild(banner);
}

/* ---------- Data layer (routes to real APIs or local mock data) ---------- */
async function getRowData(track) {
    const category = track.dataset.category;
    if (USE_MOCK_DATA) {
        return MOCK_MOVIES.filter((m) => m.category === category);
    }
    const titles = CATEGORY_TITLES[category] || [];
    const results = await Promise.all(titles.map((t) => omdbByTitle(t).catch(() => null)));
    return results.filter(Boolean);
}

async function getHeroPick() {
    if (USE_MOCK_DATA) {
        return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
    }
    const title = HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)];
    return omdbByTitle(title);
}

async function getMovieForTrailer(movie) {
    if (USE_MOCK_DATA) {
        return { title: movie.title, overview: movie.overview, trailerKey: movie.trailerKey };
    }
    const trailerKey = await youtubeTrailerKey(movie.title).catch(() => null);
    return { title: movie.title, overview: movie.overview, trailerKey };
}

async function searchMovies(query) {
    if (USE_MOCK_DATA) {
        const q = query.toLowerCase();
        return MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 8);
    }
    return (await omdbSearch(query)).slice(0, 8);
}

/* ---------- Movie card ---------- */
function movieCardHTML(movie) {
    const title = movie.title || "Untitled";
    return `
    <div class="movie-card" data-id="${movie.id}" tabindex="0" role="button" aria-label="View ${title}">
      ${movie.poster
            ? `<img src="${movie.poster}" alt="${title} poster" loading="lazy" />`
            : `<div class="w-full h-full grid place-items-center text-xs text-gray-500 p-2 text-center">${title}</div>`
        }
      <div class="card-overlay">
        <div class="card-title">${title}</div>
        <div class="card-meta">${movie.rating ? "★ " + movie.rating + " · " : ""}${movie.year || "—"}</div>
      </div>
    </div>`;
}

function skeletonRow(count = 8) {
    return Array.from({ length: count })
        .map(() => `<div class="card-skeleton"></div>`)
        .join("");
}

/* ---------- Populate a category row ---------- */
const moviesById = new Map(); // lets card clicks find the full movie object again

async function loadRow(track) {
    track.innerHTML = skeletonRow();
    try {
        const results = await getRowData(track);
        results.forEach((m) => moviesById.set(String(m.id), m));
        track.innerHTML = results.map(movieCardHTML).join("");
        track.querySelectorAll(".movie-card").forEach((card) => {
            card.addEventListener("click", () => openTrailer(card.dataset.id));
            card.addEventListener("keypress", (e) => {
                if (e.key === "Enter") openTrailer(card.dataset.id);
            });
        });
    } catch (err) {
        track.innerHTML = `<p class="text-gray-500 text-sm py-6">Couldn't load this row right now.</p>`;
        console.error(err);
    }
}

/* ---------- Hero ---------- */
async function loadHero() {
    const tagEl = document.getElementById("heroTag");
    const titleEl = document.getElementById("heroTitle");
    const overviewEl = document.getElementById("heroOverview");
    const buttonsEl = document.getElementById("heroButtons");
    const backdropEl = document.getElementById("heroBackdrop");

    try {
        const pick = await getHeroPick();
        if (!pick) throw new Error("No hero pick found");

        moviesById.set(String(pick.id), pick);
        backdropEl.style.backgroundImage = `url(${pick.poster})`;
        tagEl.textContent = "Featured Today";
        titleEl.textContent = pick.title;
        overviewEl.textContent = pick.overview;
        heroState.currentId = pick.id;

        [tagEl, titleEl, overviewEl, buttonsEl].forEach((el, i) => {
            el.style.animationDelay = `${i * 0.12}s`;
            el.classList.add("hero-anim");
            el.classList.remove("opacity-0");
        });
    } catch (err) {
        titleEl.textContent = "Add your API keys to load a featured title";
        titleEl.classList.remove("opacity-0");
        console.error(err);
    }
}

const heroState = { currentId: null };

/* ---------- Trailer modal ---------- */
const trailerModalEl = document.getElementById("trailerModal");
const trailerModal = new bootstrap.Modal(trailerModalEl);

async function openTrailer(movieId) {
    const movie = moviesById.get(String(movieId));
    if (!movie) return;

    document.getElementById("trailerModalLabel").textContent = "Loading…";
    document.getElementById("trailerOverview").textContent = "";
    document.getElementById("trailerFrameWrap").innerHTML =
        `<div class="flex items-center justify-center text-gray-400 text-sm">Loading trailer…</div>`;
    trailerModal.show();

    try {
        const { title, overview, trailerKey } = await getMovieForTrailer(movie);

        document.getElementById("trailerModalLabel").textContent = title;
        document.getElementById("trailerOverview").textContent = overview;

        const wrap = document.getElementById("trailerFrameWrap");
        if (trailerKey) {
            wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailerKey}?autoplay=1"
        title="Trailer" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            wrap.innerHTML = `<div class="flex items-center justify-center text-gray-400 text-sm p-6 text-center">No trailer available for this title.</div>`;
        }
    } catch (err) {
        document.getElementById("trailerModalLabel").textContent = "Error";
        document.getElementById("trailerFrameWrap").innerHTML =
            `<div class="flex items-center justify-center text-gray-400 text-sm">Couldn't load the trailer.</div>`;
        console.error(err);
    }
}

document.getElementById("heroPlayBtn").addEventListener("click", () => {
    if (heroState.currentId) openTrailer(heroState.currentId);
});
document.getElementById("heroInfoBtn").addEventListener("click", () => {
    if (heroState.currentId) openTrailer(heroState.currentId);
});

/* ---------- Search ---------- */
const searchToggle = document.getElementById("searchToggle");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchToggle.addEventListener("click", () => {
    searchBox.classList.toggle("hidden");
    if (!searchBox.classList.contains("hidden")) searchInput.focus();
});
document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
        searchBox.classList.add("hidden");
    }
});

const runSearch = debounce(async (query) => {
    if (!query.trim()) {
        searchResults.innerHTML = "";
        return;
    }
    searchResults.innerHTML = `<p class="text-xs text-gray-500 px-2">Searching…</p>`;
    try {
        const results = await searchMovies(query);
        results.forEach((m) => moviesById.set(String(m.id), m));
        if (!results.length) {
            searchResults.innerHTML = `<p class="text-xs text-gray-500 px-2">No titles found.</p>`;
            return;
        }
        searchResults.innerHTML = results
            .map(
                (m) => `
      <div class="search-result-item" data-id="${m.id}">
        <img src="${m.poster}" alt="" />
        <div>
          <div class="text-sm font-medium">${m.title}</div>
          <div class="text-xs text-gray-500">${m.year || "—"}</div>
        </div>
      </div>`
            )
            .join("");
        searchResults.querySelectorAll(".search-result-item").forEach((item) => {
            item.addEventListener("click", async () => {
                // Search results don't include plot/overview yet (OMDb's
                // search endpoint is lightweight) — fetch full detail first.
                const id = item.dataset.id;
                let movie = moviesById.get(String(id));
                if (!USE_MOCK_DATA && movie && !movie.overview) {
                    const full = await omdbByTitle(movie.title).catch(() => null);
                    if (full) moviesById.set(String(id), full);
                }
                openTrailer(id);
                searchBox.classList.add("hidden");
                searchInput.value = "";
                searchResults.innerHTML = "";
            });
        });
    } catch (err) {
        searchResults.innerHTML = `<p class="text-xs text-gray-500 px-2">Search failed.</p>`;
        console.error(err);
    }
}, 350);

searchInput.addEventListener("input", (e) => runSearch(e.target.value));

/* ---------- Nav scroll + mobile menu ---------- */
const mainNav = document.getElementById("mainNav");
window.addEventListener("scroll", () => {
    mainNav.classList.toggle("scrolled", window.scrollY > 40);
});

const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
navToggle.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.add("hidden"))
);

/* ---------- Init ---------- */
function init() {
    if (USE_MOCK_DATA) {
        renderBanner(
            `Showing sample data. Set <code class="font-mono">USE_MOCK_DATA = false</code> and add your OMDb + YouTube keys in <code class="font-mono">js/config.js</code> for real movies.`
        );
    } else if (!hasValidKeys()) {
        renderBanner(`Add your free OMDb + YouTube API keys in <code class="font-mono">js/config.js</code> to load real movie data.`);
    }
    loadHero();
    document.querySelectorAll(".row-track").forEach(loadRow);
}
init();