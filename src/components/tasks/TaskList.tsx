import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import type {Task, CreateTaskData} from "../../types/task";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import TaskDetail from "./TaskDetail";

interface TaskListProps {
  tasks: Task[];
  onCreateTask: (data: CreateTaskData) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  loading?: boolean;
}

export default function TaskList({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  loading = false,
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "done"
  >("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const handleCreateTask = (data: CreateTaskData) => {
    onCreateTask(data);
    setShowForm(false);
  };

  const getFilterConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {icon: "⏳", color: "text-orange-300"};
      case "in-progress":
        return {icon: "⚡", color: "text-blue-300"};
      case "done":
        return {icon: "✅", color: "text-green-300"};
      default:
        return {icon: "📋", color: "text-white"};
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-dark rounded-2xl p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-6 bg-white/10 rounded-lg mb-2 w-3/4"></div>
              <div className="h-4 bg-white/10 rounded-lg mb-4 w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-white/10 rounded-full w-20"></div>
                <div className="h-6 bg-white/10 rounded-full w-16"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-white/10 rounded-lg w-20"></div>
              <div className="h-8 bg-white/10 rounded-lg w-8"></div>
              <div className="h-8 bg-white/10 rounded-lg w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="relative pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            className="text-center my-16"
          >
            <motion.p
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.4, duration: 0.8}}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Manage your tasks with style and efficiency. Beautiful, intuitive,
              and powerful.
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.8, duration: 0.8}}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {(["all", "pending", "in-progress", "done"] as const).map(
              (status, index) => {
                const config = getFilterConfig(status);
                return (
                  <motion.button
                    key={status}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.8 + index * 0.1, duration: 0.6}}
                    onClick={() => setFilter(status)}
                    className={`glass rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                      filter === status
                        ? "border-purple-400 bg-purple-500/20"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                  >
                    <div className="text-center">
                      <div className={`text-3xl mb-2 ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {taskCounts[status]}
                      </div>
                      <div className="text-white/70 text-sm capitalize">
                        {status === "all" ? "Total" : status.replace("-", " ")}
                      </div>
                    </div>
                  </motion.button>
                );
              }
            )}
          </motion.div>

          {/* Tasks Section */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 1, duration: 0.8}}
            className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-white/20"
          >
            {loading ? (
              <LoadingSkeleton />
            ) : filteredTasks.length === 0 ? (
              <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.5}}
                className="text-center py-16"
              >
                <motion.div
                  initial={{scale: 0}}
                  animate={{scale: 1}}
                  transition={{delay: 0.2, type: "spring", stiffness: 200}}
                  className="mx-auto h-24 w-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
                >
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2M9 5a2 2 0 012 2v11a2 2 0 01-2 2M9 5a2 2 0 012 2v11a2 2 0 01-2 2m6-11V7a2 2 0 00-2-2M15 5v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2z"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {filter === "all"
                    ? "No tasks yet"
                    : `No ${filter.replace("-", " ")} tasks`}
                </h3>
                <p className="text-white/60 mb-8 text-lg">
                  {filter === "all"
                    ? "Ready to boost your productivity? Create your first task!"
                    : `No tasks with "${filter.replace(
                        "-",
                        " "
                      )}" status found. Try a different filter.`}
                </p>
                {filter === "all" && (
                  <motion.button
                    onClick={() => setShowForm(true)}
                    className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                  >
                    <svg
                      className="w-5 h-5 mr-2 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Your First Task
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {filter === "all"
                      ? "All Tasks"
                      : `${filter.replace("-", " ")} Tasks`}
                  </h2>
                  <div className="text-white/60 text-sm sm:text-base">
                    {filteredTasks.length}{" "}
                    {filteredTasks.length === 1 ? "task" : "tasks"}
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -20, scale: 0.95}}
                      transition={{delay: index * 0.1, duration: 0.4}}
                    >
                      <div className="rounded-xl sm:rounded-2xl p-0 xs:p-0.5 sm:p-1">
                        <TaskItem
                          task={task}
                          onUpdate={onUpdateTask}
                          onDelete={onDeleteTask}
                          onViewDetails={setSelectedTask}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transform transition-all duration-300 hover:scale-110 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Create new task"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </motion.button>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={onUpdateTask}
            onDelete={(id) => {
              onDeleteTask(id);
              setSelectedTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
