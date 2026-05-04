import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import HackCard from "../components/HackCard";
import PageLayout from "../components/PageLayout";
import {
  landingStats
} from "../data/siteData";
import { fetchTrendingHackathons, mapApiHackathonToCard } from "../services/hackathonsApi";

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHackathons() {
      try {
        const response = await fetchTrendingHackathons(3);
        if (active && response?.data) {
          const mapped = response.data.map((item, index) => mapApiHackathonToCard(item, index));
          setHackathons(mapped);
        }
      } catch (error) {
        console.error("Failed to load trending hackathons:", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHackathons();
    return () => { active = false; };
  }, []);

  function openSearch(nextQuery) {
    const value = nextQuery.trim();
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : "/explore");
  }

  function handleSubmit(event) {
    event.preventDefault();
    openSearch(query);
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-black border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your Next Hackathon
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-gray-400 sm:text-lg md:mt-8 md:max-w-3xl md:text-xl">
            Stop missing hackathons because they were buried somewhere online. 
            Discover deadlines, niche bounties, and events that fit your schedule.
          </p>

          <div className="mx-auto mt-10 max-w-2xl sm:flex sm:justify-center">
            <form onSubmit={handleSubmit} className="w-full sm:max-w-lg sm:flex">
              <input
                className="input-field mb-3 sm:mb-0"
                id="search-hackathons"
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search "AI", "Online", or "Weekend Event"'
                type="text"
                value={query}
              />
              <button className="btn-primary w-full sm:w-auto" type="submit">
                Search
              </button>
            </form>
          </div>
          
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            {["Beginner Friendly", "AI", "Online", "Frontend"].map((chip) => (
              <button
                key={chip}
                onClick={() => openSearch(chip)}
                className="rounded-full bg-transparent border border-gray-700 px-4 py-1.5 text-sm font-medium text-gray-400 hover:border-gray-400 hover:text-white transition-colors"
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-black border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {landingStats.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-white tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Featured Upcoming Events</h2>
            <p className="mt-2 text-gray-400">
              A carefully curated selection of high-quality events.
            </p>
          </div>
          <Link className="hidden md:inline-flex text-sm font-medium text-gray-400 hover:text-white mt-4 md:mt-0 transition-colors" to="/explore">
            View All Events &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((item) => (
              <HackCard
                ctaLabel="View Details"
                item={item}
                key={item.slug ?? item.title}
              />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center gap-4 md:hidden">
          <Link className="btn-primary w-full" to="/explore">
            Browse All Hackathons
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}



