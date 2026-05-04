import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useSavedHackathons } from "../hooks/useSavedHackathons";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { savedHackathons } = useSavedHackathons();

  // Generate dynamic calendar for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);
  
  // 0 = Sunday, 1 = Monday...
  const firstDayOfWeek = new Date(year, month, 1).getDay(); 
  // Adjust for Monday start (0 = Mon, 6 = Sun)
  let offset = firstDayOfWeek - 1;
  if (offset === -1) offset = 6; 
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dynamicDays = [];
  for (let i = 0; i < offset; i++) dynamicDays.push({ ghost: true });
  for (let i = 1; i <= daysInMonth; i++) {
    dynamicDays.push({ day: String(i), events: [] });
  }

  // Populate events
  savedHackathons.forEach(hack => {
    const deadlineString = hack.rawDeadline || hack.deadline;
    if (!deadlineString) return;
    const d = new Date(deadlineString);
    // Only show events for current month on the visual grid
    if (!isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
      const dayStr = String(d.getDate());
      const cell = dynamicDays.find(c => c.day === dayStr);
      if (cell) {
        cell.events.push(hack);
      }
    }
  });

  // Calculate total rows needed (at least 5 rows = 35 cells)
  const totalCells = dynamicDays.length;
  const paddingNeeded = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < paddingNeeded; i++) dynamicDays.push({ ghost: true });
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
                    {monthName} {year}
                  </h1>
                  <p className="mt-2 text-gray-400 max-w-2xl">
                    Your manually saved hackathons, plotted on the timeline so you never miss a deadline.
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

                {dynamicDays.map((entry, index) => {
                  if (entry.ghost) {
                    return (
                      <div
                        className="bg-black min-h-[120px] p-2"
                        key={`ghost-${index}`}
                      />
                    );
                  }

                  const hasEvents = entry.events && entry.events.length > 0;

                  return (
                    <div
                      key={entry.day}
                      className={`bg-black min-h-[120px] p-2 flex flex-col transition-colors ${
                        hasEvents ? "ring-1 ring-inset ring-white" : ""
                      }`}
                    >
                      <span className={`text-sm font-semibold ${hasEvents ? 'text-white' : 'text-gray-500'}`}>
                        {entry.day}
                      </span>

                      {hasEvents && (
                        <div className="mt-1 space-y-1">
                          {entry.events.map(ev => (
                            <Link 
                              key={ev.id} 
                              to={`/details/${ev.slug}`}
                              className="block p-1 bg-gray-900 border border-gray-800 hover:border-gray-500 transition-colors"
                            >
                              <p className="text-xs font-medium leading-tight text-gray-300 truncate">
                                {ev.title}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
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
              <h2 className="text-lg font-bold text-white mb-4">Saved Hackathons</h2>
              <div className="space-y-4">
                {savedHackathons.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hackathons saved yet. Browse the board to find and track events!
                  </p>
                ) : (
                  savedHackathons.map((item) => {
                    let dateLabel = "No deadline";
                    const deadlineString = item.rawDeadline || item.deadline;
                    if (deadlineString) {
                      const d = new Date(deadlineString);
                      if (!isNaN(d.getTime())) {
                        dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
                      } else {
                        dateLabel = item.deadlineLabel || "TBD";
                      }
                    }
                    return (
                      <article
                        className="border-l border-white pl-4 py-2"
                        key={item.id}
                      >
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          {dateLabel}
                        </p>
                        <h3 className="text-sm font-bold text-white">
                          <Link to={`/details/${item.slug}`} className="hover:text-gray-300">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                      </article>
                    );
                  })
                )}
              </div>

              <Link className="btn-primary w-full mt-6" to="/explore">
                Explore More
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}




