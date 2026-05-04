import { Link } from "react-router-dom";
import { useSavedHackathons } from "../hooks/useSavedHackathons";

export default function HackCard({
  item,
  ctaLabel = "View Details",
  ctaTo,
  compact = false,
  className = ""
}) {
  const resolvedCtaTo = ctaTo ?? (item.slug ? `/details/${item.slug}` : "/details");
  const { isSaved, saveHackathon, unsaveHackathon } = useSavedHackathons();
  const saved = isSaved(item.id);

  const handleSaveToggle = (e) => {
    e.preventDefault();
    if (saved) {
      unsaveHackathon(item.id);
    } else {
      saveHackathon(item);
    }
  };

  return (
    <article className={`card flex flex-col p-6 transition-colors hover:border-gray-500 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 text-xs font-medium border border-gray-800 text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{item.host}</p>
        <h3 className={`font-bold text-white mb-3 ${compact ? 'text-xl' : 'text-2xl'}`}>
          <Link to={resolvedCtaTo} className="hover:text-gray-300 transition-colors">
            {item.title}
          </Link>
        </h3>
        
        <div className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {item.deadlineLabel || item.deadline}
        </div>

        <p className="text-gray-400 text-sm mb-5 line-clamp-3">
          {item.summary}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
          <span className="flex items-center">{item.theme}</span>
          <span className="flex items-center">&bull;</span>
          <span className="flex items-center">{item.format}</span>
          <span className="flex items-center">&bull;</span>
          <span className="flex items-center">{item.location}</span>
        </div>

        {item.tech && item.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tech.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 border border-gray-800 bg-transparent text-xs font-medium text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {item.note && (
        <div className="border border-gray-700 p-3 mb-4 text-sm text-gray-300">
          <span className="font-bold mr-2">Note:</span>
          {item.note}
        </div>
      )}

      <div className="mt-auto pt-5 border-t border-gray-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prize</div>
          <div className="text-lg font-bold text-white">{item.prize}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveToggle}
            type="button"
            className={`p-2 rounded-full border transition-colors ${
              saved 
                ? "bg-white text-black border-white hover:bg-gray-200" 
                : "bg-transparent text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
            }`}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <Link className="btn-secondary" to={resolvedCtaTo}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
