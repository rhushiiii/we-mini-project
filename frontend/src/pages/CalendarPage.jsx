import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { calendarDays, calendarHighlights } from "../data/siteData";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <section className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Deadline Wall</p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    April 2026
                  </h1>
                  <p className="mt-2 text-gray-400 max-w-2xl">
                    Use this when your brain wants one place to see all the closing dates.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-800 border border-gray-800">
                {daysOfWeek.map((day) => (
                  <div
                    className="bg-black py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    key={day}
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((entry, index) => {
                  if (entry.ghost) {
                    return (
                      <div
                        className="bg-black min-h-[120px] p-2"
                        key={`ghost-${index}`}
                      />
                    );
                  }

                  const cell = (
                    <div
                      className={`bg-black min-h-[120px] p-2 flex flex-col transition-colors ${
                        entry.focus
                          ? "ring-1 ring-inset ring-white hover:bg-gray-900"
                          : entry.event
                            ? "hover:bg-gray-900"
                            : ""
                      }`}
                    >
                      <span className={`text-sm font-semibold ${entry.focus ? 'text-white' : 'text-gray-500'}`}>
                        {entry.day}
                      </span>

                      {entry.event ? (
                        <div className="mt-1">
                          <p className={`text-xs font-medium leading-tight ${entry.focus ? 'text-white' : 'text-gray-400'}`}>
                            {entry.event}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );

                  if (entry.focus) {
                    return (
                      <Link key={entry.day} to="/details" className="block">
                        {cell}
                      </Link>
                    );
                  }

                  return <div key={entry.day}>{cell}</div>;
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-2">
                Plan Ahead
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Half the stress comes from remembering the date too late. Do your future-self a favor and shortlist early.
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h2>
              <div className="space-y-4">
                {calendarHighlights.map((item) => (
                  <article
                    className="border-l border-white pl-4 py-2"
                    key={item.date}
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.date}</p>
                    <h3 className="text-sm font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{item.copy}</p>
                  </article>
                ))}
              </div>

              <Link className="btn-primary w-full mt-6" to="/details">
                View Featured Hackathon
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}




