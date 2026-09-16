/* ==========================================================
   CINEMAX — Netflix-style landing page + movie search
   Data source: TMDB API (https://www.themoviedb.org/)
   ========================================================== */

const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

const headers = {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
};

const hasValidKey = () =>
    TMDB_ACCESS_TOKEN && !TMDB_ACCESS_TOKEN.startsWith("PASTE_");

/* ---------- Small fetch helper ---------- */
async function tmdb(path, params = {}) {
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
    return res.json();
}

/* ---------- Utilities ---------- */
function img(path, size = "w342") {
    if (!path) return "";
    if (path.startsWith("http")) return path; // mock data already has full URLs
    return `${IMG_BASE}/${size}${path}`;
}
function debounce(fn, delay = 350) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}
function yearOf(dateStr) {
    return dateStr ? dateStr.slice(0, 4) : "—";
}

/* ---------- Status banner ---------- */
function renderBanner(message) {
    const banner = document.createElement("div");
    banner.className =
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-crimson/95 text-white text-sm px-5 py-3 rounded-lg shadow-xl max-w-md text-center";
    banner.innerHTML = message;
    document.body.appendChild(banner);
}

/* ---------- Data layer (routes to TMDB or local mock data) ---------- */
async function getRowData(track) {
    if (USE_MOCK_DATA) {
        if (track.dataset.genre) {
            const gid = Number(track.dataset.genre);
            return MOCK_MOVIES.filter((m) => m.genre_ids.includes(gid));
        }
        // trending / popular / top_rated all just shuffle the same pool for demo purposes
        return [...MOCK_MOVIES].sort(() => Math.random() - 0.5);
    }
    if (track.dataset.endpoint) {
        const data = await tmdb(`/movie/${track.dataset.endpoint}`, { page: 1 });
        return data.results || [];
    }
    const data = await tmdb("/discover/movie", {
        with_genres: track.dataset.genre,
        sort_by: "popularity.desc",
        page: 1,
    });
    return data.results || [];
}

async function getHeroPick() {
    if (USE_MOCK_DATA) {
        return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
    }
    const data = await tmdb("/trending/movie/week");
    return data.results[Math.floor(Math.random() * Math.min(5, data.results.length))];
}

async function getMovieForTrailer(movieId) {
    if (USE_MOCK_DATA) {
        const movie = MOCK_MOVIES.find((m) => m.id === movieId);
        return {
            title: movie ? movie.title : "Untitled",
            overview: movie ? movie.overview : "",
            trailerKey: movie ? movie.trailer_key : null,
        };
    }
    const [details, videos] = await Promise.all([
        tmdb(`/movie/${movieId}`),
        tmdb(`/movie/${movieId}/videos`),
    ]);
    const trailer =
        videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
        videos.results.find((v) => v.site === "YouTube");
    return {
        title: details.title,
        overview: details.overview || "",
        trailerKey: trailer ? trailer.key : null,
    };
}

async function searchMovies(query) {
    if (USE_MOCK_DATA) {
        const q = query.toLowerCase();
        return MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 8);
    }
    const data = await tmdb("/search/movie", { query, include_adult: false });
    return data.results.slice(0, 8);
}

/* ---------- Movie card ---------- */
function movieCardHTML(movie) {
    const title = movie.title || movie.name || "Untitled";
    const poster = img(movie.poster_path);
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
    return `
    <div class="movie-card" data-id="${movie.id}" tabindex="0" role="button" aria-label="View ${title}">
      ${poster
            ? `<img src="${poster}" alt="${title} poster" loading="lazy" />`
            : `<div class="w-full h-full grid place-items-center text-xs text-gray-500 p-2 text-center">${title}</div>`
        }
      <div class="card-overlay">
        <div class="card-title">${title}</div>
        <div class="card-meta">★ ${rating} · ${yearOf(movie.release_date)}</div>
      </div>
    </div>`;
}

function skeletonRow(count = 8) {
    return Array.from({ length: count })
        .map(() => `<div class="card-skeleton"></div>`)
        .join("");
}

/* ---------- Populate a category row ---------- */
async function loadRow(track) {
    track.innerHTML = skeletonRow();
    try {
        const results = await getRowData(track);
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

        backdropEl.style.backgroundImage = `url(${img(pick.backdrop_path, "original")})`;
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
        titleEl.textContent = "Add your TMDB key to load a featured title";
        titleEl.classList.remove("opacity-0");
        console.error(err);
    }
}

const heroState = { currentId: null };

/* ---------- Trailer modal ---------- */
const trailerModalEl = document.getElementById("trailerModal");
const trailerModal = new bootstrap.Modal(trailerModalEl);

async function openTrailer(movieId) {
    document.getElementById("trailerModalLabel").textContent = "Loading…";
    document.getElementById("trailerOverview").textContent = "";
    document.getElementById("trailerFrameWrap").innerHTML =
        `<div class="flex items-center justify-center text-gray-400 text-sm">Loading trailer…</div>`;
    trailerModal.show();

    try {
        const { title, overview, trailerKey } = await getMovieForTrailer(movieId);

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
        if (!results.length) {
            searchResults.innerHTML = `<p class="text-xs text-gray-500 px-2">No titles found.</p>`;
            return;
        }
        searchResults.innerHTML = results
            .map(
                (m) => `
      <div class="search-result-item" data-id="${m.id}">
        <img src="${img(m.poster_path, "w92")}" alt="" />
        <div>
          <div class="text-sm font-medium">${m.title}</div>
          <div class="text-xs text-gray-500">${yearOf(m.release_date)}</div>
        </div>
      </div>`
            )
            .join("");
        searchResults.querySelectorAll(".search-result-item").forEach((item) => {
            item.addEventListener("click", () => {
                openTrailer(item.dataset.id);
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
            `Showing sample data. Set <code class="font-mono">USE_MOCK_DATA = false</code> and add your TMDB key in <code class="font-mono">js/config.js</code> for real movies.`
        );
    } else if (!hasValidKey()) {
        renderBanner(`Add your free TMDB API key in <code class="font-mono">js/config.js</code> to load real movie data.`);
    }
    loadHero();
    document.querySelectorAll(".row-track").forEach(loadRow);
}
init();