export default function FilterPanel({
  theme,
  setTheme,
  themeOptions,
  format,
  setFormat,
  formatOptions,
  vibe,
  setVibe,
  vibeOptions
}) {
  const renderOptions = (options, value, onChange) =>
    options.map((option) => {
      const normalized = option === "All" ? "All" : option;
      const active = value === normalized;

      return (
        <button
          key={option}
          className={`px-3 py-1.5 text-sm font-medium transition-colors border ${
            active
              ? "bg-white text-black border-white"
              : "bg-black text-gray-400 border-gray-800 hover:border-gray-500 hover:text-white"
          }`}
          onClick={() => onChange(normalized)}
          type="button"
        >
          {option}
        </button>
      );
    });

  return (
    <aside className="p-6 xl:sticky xl:top-24 border border-gray-800 bg-black">
      <h2 className="text-xl font-bold text-white mb-2">
        Filters
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Refine your search to find the perfect hackathon.
      </p>

      <div className="space-y-8">
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Theme</h3>
          <div className="flex flex-wrap gap-2">{renderOptions(themeOptions, theme, setTheme)}</div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Format</h3>
          <div className="flex flex-wrap gap-2">{renderOptions(formatOptions, format, setFormat)}</div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vibe</h3>
          <div className="flex flex-wrap gap-2">{renderOptions(vibeOptions, vibe, setVibe)}</div>
        </section>
      </div>
    </aside>
  );
}


