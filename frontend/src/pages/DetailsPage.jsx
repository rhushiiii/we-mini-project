import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HackCard from "../components/HackCard";
import PageLayout from "../components/PageLayout";
import { recommendedHackathons, spotlightHackathon } from "../data/siteData";
import { useSavedHackathons } from "../hooks/useSavedHackathons";
import {
  fetchHackathonBySlug,
  fetchTrendingHackathons,
  mapApiHackathonToCard
} from "../services/hackathonsApi";

export default function DetailsPage() {
  const { slug } = useParams();
  const [spotlight, setSpotlight] = useState(spotlightHackathon);
  const [recommended, setRecommended] = useState(recommendedHackathons);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isSaved, saveHackathon, unsaveHackathon } = useSavedHackathons();
  
  // Create a display-safe spotlight object, ensuring we don't crash on undefined
  const displaySpotlight = useMemo(() => spotlight, [spotlight]);
  const saved = displaySpotlight.id ? isSaved(displaySpotlight.id) : false;

  const handleSaveToggle = () => {
    if (saved) {
      unsaveHackathon(displaySpotlight.id);
    } else {
      saveHackathon({
        id: displaySpotlight.id,
        slug: displaySpotlight.slug,
        title: displaySpotlight.title,
        host: displaySpotlight.host,
        summary: displaySpotlight.subtitle,
        theme: displaySpotlight.theme,
        format: displaySpotlight.format,
        location: displaySpotlight.location,
        deadline: displaySpotlight.rawDeadline, // Make sure we store raw deadline for calendar
        prize: displaySpotlight.prize,
        tags: displaySpotlight.tags,
        tech: displaySpotlight.tech
      });
    }
  };

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        if (slug) {
          const [detailsResponse, trendingResponse] = await Promise.all([
            fetchHackathonBySlug(slug),
            fetchTrendingHackathons(6)
          ]);

          if (!active) return;

          const detailItem = detailsResponse?.data;
          const trendingItems = trendingResponse?.data ?? [];

          if (detailItem) {
            setSpotlight(buildSpotlight(detailItem));
          }

          const nextRecommended = trendingItems
            .filter((item) => item.slug !== detailItem?.slug)
            .slice(0, 2)
            .map((item, index) => mapApiHackathonToCard(item, index));

          if (nextRecommended.length) {
            setRecommended(nextRecommended);
          }
        } else {
          const trendingResponse = await fetchTrendingHackathons(5);
          if (!active) return;

          const trendingItems = trendingResponse?.data ?? [];
          if (trendingItems.length) {
            setSpotlight(buildSpotlight(trendingItems[0]));
            setRecommended(
              trendingItems.slice(1, 3).map((item, index) => mapApiHackathonToCard(item, index))
            );
          }
        }
      } catch {
        if (!active) return;
        setError("Couldn’t load the latest spotlight details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-6 sm:p-8">
              <span className="inline-flex items-center px-2 py-1 border border-white text-xs font-medium text-white mb-4">
                Spotlight
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                {displaySpotlight.title}
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                {displaySpotlight.subtitle}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {displaySpotlight.tags.map((tag) => (
                  <span
                    className="inline-flex items-center px-3 py-1 bg-transparent border border-gray-800 text-sm font-medium text-gray-300"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  ["Host", displaySpotlight.host],
                  ["Location", displaySpotlight.location],
                  ["Format", displaySpotlight.format],
                  ["Deadline", displaySpotlight.deadline],
                  ["Build window", displaySpotlight.buildWindow],
                  ["Team size", displaySpotlight.team]
                ].map(([label, value]) => (
                  <div className="border border-gray-800 p-4" key={label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-800">
                <button 
                  onClick={handleSaveToggle}
                  className={saved ? "btn-secondary" : "btn-primary"}
                  type="button"
                >
                  {saved ? "Saved to Calendar" : "Save to Calendar"}
                </button>
                <Link className="btn-secondary" to="/explore">
                  Back to Board
                </Link>
              </div>
            </section>

            {loading ? (
              <section className="card p-8 text-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                 <p className="text-gray-500">Loading full details...</p>
              </section>
            ) : (
              <div className="space-y-8">
                <section className="card p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">The Brief</h2>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                    {displaySpotlight.description}
                  </p>
                </section>

                <section className="card p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Tracks & Challenges</h2>
                  <div className="flex flex-wrap gap-3">
                    {displaySpotlight.tracks.map((track) => (
                      <span
                        className="inline-flex items-center px-4 py-2 bg-transparent border border-gray-700 text-sm font-medium text-gray-300"
                        key={track}
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="card p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Timeline</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {displaySpotlight.timeline.map((item) => (
                      <div className="border border-gray-800 p-4" key={item.label}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-3">Why it's hot</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{displaySpotlight.whyItHits}</p>
            </div>

            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Prize Pool</h2>
              <div className="text-4xl font-bold text-white mb-2">
                {displaySpotlight.prize}
              </div>
              <p className="text-gray-500 text-sm">
                Competitive prize pool for top teams.
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Perks</h2>
              <ul className="space-y-3">
                {displaySpotlight.perks.map((perk) => (
                  <li className="flex items-start" key={perk}>
                    <svg className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-400">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4">Similar Hackathons</h2>
              <div className="space-y-4">
                {recommended.map((item) => (
                  <HackCard compact ctaLabel="View" item={item} key={item.title} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="card p-6 border-red-900">
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function buildSpotlight(item) {
  const tags = Array.isArray(item.tags) && item.tags.length ? item.tags.slice(0, 4) : ["fresh listing"];
  const tracks = Array.isArray(item.tech) && item.tech.length ? item.tech.slice(0, 3) : ["Build quality", "Demo speed", "Practical utility"];

  return {
    title: item.title ?? spotlightHackathon.title,
    subtitle: item.summary ?? "For teams who like practical demos more than dramatic pitch decks.",
    host: item.host ?? "Host not listed",
    location: item.location ?? "Location TBD",
    format: item.format ? item.format.toUpperCase() : "UNKNOWN",
    deadline: item.deadlineLabel ?? "Deadline TBD",
    buildWindow: "Typical sprint format (48-72 hours)",
    prize: item.prize ?? "Prize TBD",
    team: "Solo to 5 people",
    whyItHits:
      item.summary ??
      "This listing is trending because it balances clear scope, practical judging, and strong team viability.",
    description:
      item.description ??
      item.summary ??
      "Detailed brief is currently being synchronized from source listings.",
    tags,
    tracks,
    timeline: [
      { label: "Discover", value: "Now indexed on HackHunt" },
      { label: "Apply", value: item.deadlineLabel ?? "Check source page" },
      { label: "Build", value: "After acceptance / challenge kickoff" }
    ],
    perks: [
      "Structured challenge format and clear deliverables.",
      "Direct source link preserved for official updates.",
      "Indexed with ranking signals for easier shortlist decisions."
    ],
    id: item.id,
    slug: item.slug,
    theme: item.theme,
    rawDeadline: item.deadline,
    tech: item.tech
  };
}




