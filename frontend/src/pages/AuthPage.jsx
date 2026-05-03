import { Link } from "react-router-dom";
import GoogleButton from "../components/GoogleButton";
import PageLayout from "../components/PageLayout";
import { authReasons } from "../data/siteData";

export default function AuthPage() {
  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Save the good ones.
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Create an account to keep track of deadlines, save hackathons to your shortlist, and never lose that one perfect event you found at 2 AM.
            </p>

            <div className="space-y-4">
              {authReasons.map((reason) => (
                <div key={reason} className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-300">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8 sm:p-10 flex flex-col justify-center bg-black">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400 mb-8">
              Sign in to continue to HackHunt.
            </p>
            
            <div className="space-y-4">
              <GoogleButton>Continue with Google</GoogleButton>
              
              <div className="relative mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Link className="btn-secondary w-full justify-center" to="/explore">
                Continue as Guest
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                This is a demo frontend. Authentication is not actually connected.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}




