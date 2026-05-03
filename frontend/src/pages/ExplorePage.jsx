import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import HackCard from "../components/HackCard";
import PageLayout from "../components/PageLayout";
import { formatFilters, themeFilters, vibeFilters } from "../data/siteData";
import {
  fetchHackathonFilters,
  fetchHackathons,
  mapApiHackathonToCard,
  searchHackathons
} from "../services/hackathonsApi";

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [theme, setTheme] = useState("All");
  const [format, setFormat] = useState("All");
  const [vibe, setVibe] = useState("All");
  const [page, setPage] = useState(1);
  const [hackathons, setHackathons] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    themes: themeFilters,
    formats: formatFilters,
    vibes: vibeFilters
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    fetchHackathonFilters()
      .then((response) => {
        if (!active || !response?.data) return;
        const themes = response.data.themes?.length ? ["All", ...response.data.themes] : themeFilters;
        const formats = response.data.formats?.length ? ["All", ...response.data.formats] : formatFilters;
        const vibes = response.data.vibes?.length ? ["All", ...response.data.vibes] : vibeFilters;
        setFilters({ themes, formats, vibes });
      })
      .catch(() => {
        setFilters({ themes: themeFilters, formats: formatFilters, vibes: vibeFilters });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const normalizedQuery = deferredQuery.trim();

    async function loadHackathons() {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          theme: theme !== "All" ? theme : undefined,
          format: format !== "All" ? format : undefined,
          vibe: vibe !== "All" ? vibe : undefined
        };

        const response = normalizedQuery
          ? await searchHackathons(normalizedQuery, params)
          : await fetchHackathons(params);

        if (!active) return;

        const mapped = (response?.data ?? []).map((item, index) => mapApiHackathonToCard(item, index));
        setHackathons(mapped);
        setMeta(response?.meta ?? { page, limit: PAGE_SIZE, total: mapped.length, totalPages: 1 });
      } catch {
        if (!active) return;
        setError("Couldn’t load fresh listings. Try again in a moment.");
        setHackathons([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHackathons();

    return () => {
      active = false;
    };
  }, [deferredQuery, format, page, theme, vibe]);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterPanel
              format={format}
              formatOptions={filters.formats}
              setFormat={(next) => {
                setFormat(next);
                setPage(1);
              }}
              setTheme={(next) => {
                setTheme(next);
                setPage(1);
              }}
              setVibe={(next) => {
                setVibe(next);
                setPage(1);
              }}
              theme={theme}
              themeOptions={filters.themes}
              vibe={vibe}
              vibeOptions={filters.vibes}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-4">
                Explore Hackathons
              </h1>
              <p className="text-gray-400 mb-6">
                Search by theme, format, or technology to find your next project.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  className="input-field flex-grow"
                  onChange={(event) =>
                    startTransition(() => {
                      setQuery(event.target.value);
                      setPage(1);
                    })
                  }
                  placeholder='Search "AI", "frontend", or "remote"'
                  type="text"
                  value={query}
                />
                <button
                  className="btn-secondary whitespace-nowrap"
                  onClick={() => {
                    setQuery("");
                    setTheme("All");
                    setFormat("All");
                    setVibe("All");
                    setPage(1);
                  }}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {["easy win", "mentor-heavy", "irl", "DevTools", "AI"].map((chip) => (
                  <button
                    key={chip}
                    className="inline-flex items-center px-3 py-1 bg-transparent border border-gray-800 text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
                    onClick={() =>
                      startTransition(() => {
                        setQuery(chip);
                        setPage(1);
                      })
                    }
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-white">{meta.total}</span> results
              </p>
              <Link className="text-sm font-bold text-white hover:text-gray-400 transition-colors" to="/calendar">
                View on Calendar &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
                <p className="text-gray-500">Fetching the latest hackathons.</p>
              </div>
            ) : error ? (
              <div className="card p-8 text-center border-red-900">
                <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                <p className="text-gray-400">{error}</p>
              </div>
            ) : hackathons.length ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {hackathons.map((item) => (
                    <HackCard
                      ctaLabel="View Details"
                      item={item}
                      key={item.slug ?? item.title}
                    />
                  ))}
                </div>

                {meta.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-800 bg-black px-4 py-3 sm:px-6 rounded-none">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={page <= 1}
                        className="btn-secondary"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
                        disabled={page >= meta.totalPages}
                        className="btn-secondary"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Showing page <span className="font-bold text-white">{meta.page}</span> of{' '}
                          <span className="font-bold text-white">{meta.totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                            disabled={page <= 1}
                            className="relative inline-flex items-center px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-900 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            &larr;
                          </button>
                          <button
                            onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
                            disabled={page >= meta.totalPages}
                            className="relative inline-flex items-center px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-900 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            &rarr;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-8 text-center">
                <h2 className="text-xl font-bold text-white mb-2">No matches found</h2>
                <p className="text-gray-400">
                  Try clearing some filters or searching for different keywords.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}




