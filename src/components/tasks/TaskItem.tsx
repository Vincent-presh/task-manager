import {useState} from "react";
import {motion} from "framer-motion";
import type {Task} from "../../types/task";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (task: Task) => void;
}

export default function TaskItem({task, onUpdate, onDelete, onViewDetails}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );

  const handleStatusChange = (
    newStatus: "pending" | "in-progress" | "done"
  ) => {
    onUpdate(task.id, {status: newStatus});
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          className: "status-pending",
          label: "Pending",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "in-progress":
        return {
          className: "status-in-progress",
          label: "In Progress",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
        };
      case "done":
        return {
          className: "status-done",
          label: "Completed",
          icon: (
            <svg
              className="w-4 h-4"
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
          ),
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600",
          label: status,
          icon: null,
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          className: "priority-high",
          label: "High Priority",
          icon: (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ),
        };
      case "medium":
        return {
          className: "priority-medium",
          label: "Medium Priority",
          icon: (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          ),
        };
      case "low":
        return {
          className: "priority-low",
          label: "Low Priority",
          icon: (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          ),
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600",
          label: priority,
          icon: null,
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.extras?.priority || "");

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20, scale: 0.95}}
      transition={{duration: 0.3, type: "spring", stiffness: 300}}
      className="group"
    >
      <div className=" rounded-2xl p-6 shadow-xl border border-white/10 card-hover transform transition-all duration-300 hover:border-white/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="Task title..."
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Description..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors duration-200">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-white/70 text-sm leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.className}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  {task.extras?.priority && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${priorityConfig.className}`}
                    >
                      {priorityConfig.icon}
                      {priorityConfig.label}
                    </span>
                  )}
                  {task.extras?.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 text-white/80 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {task.extras?.due_date && (
                  <div className="flex items-center text-white/60 text-xs">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Due: {new Date(task.extras.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "pending" | "in-progress" | "done"
                  )
                }
                className="text-xs w-28 px-3 py-2  border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none pr-8 transition-all duration-200"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>

            {onViewDetails && (
              <motion.button
                onClick={() => onViewDetails(task)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.9}}
                title="View Details"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </motion.button>
            )}

            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.9}}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </motion.button>

            <motion.button
              onClick={() => onDelete(task.id)}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.9}}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
