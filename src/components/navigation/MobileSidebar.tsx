import {motion} from "framer-motion";
import type {Task} from "../../types/task";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAnalytics: () => void;
  onShowNotificationSettings: () => void;
  onSignOut: () => void;
  userEmail: string;
  tasks: Task[];
}

export default function MobileSidebar({
  isOpen,
  onClose,
  onShowAnalytics,
  onShowNotificationSettings,
  onSignOut,
  userEmail,
  tasks,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: 0.3}}
        className="fixed inset-0 bg-black/60 z-50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{x: "100%"}}
        animate={{x: 0}}
        exit={{x: "100%"}}
        transition={{type: "tween", duration: 0.3}}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/10 backdrop-blur-xl border-l border-white/20 z-50 md:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="h-6 w-6 text-white"
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
                <div>
                  <h2 className="text-lg font-bold text-white">TaskFlow</h2>
                  <p className="text-sm text-white/60">
                    {userEmail?.split("@")[0]}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xl font-bold text-white">
                  {tasks.length}
                </div>
                <div className="text-xs text-white/60">
                  {tasks.length === 1 ? "Task" : "Tasks"}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xl font-bold text-green-400">
                  {tasks.filter((t) => t.status === "done").length}
                </div>
                <div className="text-xs text-white/60">Completed</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6">
            <nav className="space-y-4">
              <button
                onClick={() => handleMenuItemClick(onShowAnalytics)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <div className="flex-1 text-left">
                  <span>Analytics</span>
                  <div className="text-xs text-white/50 mt-0.5">
                    Testing only
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMenuItemClick(onShowNotificationSettings)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0 1 15 0v5z"
                  />
                </svg>
                <span>Notifications</span>
              </button>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/20">
            <button
              onClick={() => handleMenuItemClick(onSignOut)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
