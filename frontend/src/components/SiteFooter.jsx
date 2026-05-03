import { Link } from "react-router-dom";
import { footerLinks } from "../data/siteData";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-800 py-8 text-center text-gray-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-bold text-white mb-2">HackHunt</p>
        
        <div className="flex justify-center space-x-4 text-sm mb-4">
          {footerLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <p className="text-xs">
          &copy; {new Date().getFullYear()} HackHunt. Built for humans.
        </p>
      </div>
    </footer>
  );
}





