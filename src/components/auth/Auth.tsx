import {useState} from "react";
import {supabase} from "../../lib/supabase";
import {motion} from "framer-motion";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showEmailMessage, setShowEmailMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowEmailMessage(false);

    try {
      const {error} = isSignUp
        ? await supabase.auth.signUp({email, password})
        : await supabase.auth.signInWithPassword({email, password});

      if (error) {
        setError(error.message);
      } else if (isSignUp) {
        setShowEmailMessage(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 left-3/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-150"></div>
      </div>

      <motion.div
        initial={{opacity: 0, y: 20, scale: 0.9}}
        animate={{opacity: 1, y: 0, scale: 1}}
        transition={{duration: 0.8, type: "spring", stiffness: 80}}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Glass Container */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2, duration: 0.6}}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Join TaskFlow" : "Welcome back"}
            </h2>
            <p className="text-white/70 text-sm">
              {isSignUp
                ? "Create your account to get started"
                : "Sign in to continue to your tasks"}
            </p>
          </motion.div>

          <motion.form
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.4, duration: 0.6}}
            className="mt-8 space-y-6"
            onSubmit={handleAuth}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none"
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021.9 12.1M9.88 9.88a3 3 0 014.24 4.24m1.42-1.42a3 3 0 00-4.24-4.24"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.477 9-10 9S1 17 1 12 5.477 3 11 3s10 4.477 10 9z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {showEmailMessage && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                className="bg-green-600 border border-green-700 text-white px-4 py-3 rounded-xl text-sm shadow-lg"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Check your email!</p>
                    <p className="text-xs text-white/90 mt-1">
                      We've sent you a sign-in link. Click it to complete your
                      registration.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-white py-3 px-6 rounded-xl font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </div>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/70 hover:text-white transition-colors duration-200 text-sm underline decoration-dotted underline-offset-4"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Decorative Elements */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.6, duration: 0.8}}
          className="text-center text-white/60 text-xs"
        >
          <p>Secure authentication powered by Supabase</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
