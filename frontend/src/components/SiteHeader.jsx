import { Link, NavLink } from "react-router-dom";
import { navItems } from "../data/siteData";

export default function SiteHeader() {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-white tracking-tight">HackHunt</span>
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                      isActive
                        ? "border-white text-white"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/explore" className="btn-primary">
              Browse Board
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}




