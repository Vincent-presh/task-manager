import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { motion } from 'framer-motion';
import type { Task } from '../../types/task';
import TaskCard from './TaskCard';

interface VirtualTaskListProps {
  tasks: Task[];
  hasMore: boolean;
  loading: boolean;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onLoadMore: () => void;
  height?: number;
  itemHeight?: number;
}

interface TaskItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Task[];
    onTaskEdit: (task: Task) => void;
    onTaskDelete: (id: string) => void;
    hasMore: boolean;
    loading: boolean;
  };
}

const TaskItem: React.FC<TaskItemProps> = ({ index, style, data }) => {
  const { tasks, onTaskEdit, onTaskDelete, hasMore, loading } = data;
  const task = tasks[index];

  // Show loading placeholder for items beyond current data
  if (!task) {
    if (loading) {
      return (
        <div style={style} className="p-4">
          <div className="animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded-lg h-24"></div>
        </div>
      );
    }
    return null;
  }

  return (
    <div style={style} className="p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
      >
        <TaskCard
          task={task}
          onEdit={() => onTaskEdit(task)}
          onDelete={() => onTaskDelete(task.id)}
        />
      </motion.div>
    </div>
  );
};

export default function VirtualTaskList({
  tasks,
  hasMore,
  loading,
  onTaskEdit,
  onTaskDelete,
  onLoadMore,
  height = 600,
  itemHeight = 140
}: VirtualTaskListProps) {
  // Calculate total item count including potential loading items
  const itemCount = hasMore ? tasks.length + 1 : tasks.length;

  // Check if item is loaded
  const isItemLoaded = useCallback(
    (index: number) => {
      return !!tasks[index];
    },
    [tasks]
  );

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(
    () => ({
      tasks,
      onTaskEdit,
      onTaskDelete,
      hasMore,
      loading
    }),
    [tasks, onTaskEdit, onTaskDelete, hasMore, loading]
  );

  if (tasks.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
          No tasks yet
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
          Get started by creating your first task. Click the + button to add a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={onLoadMore}
        threshold={5} // Start loading 5 items before the end
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={height}
            itemCount={itemCount}
            itemSize={itemHeight}
            itemData={itemData}
            onItemsRendered={onItemsRendered}
            className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
          >
            {TaskItem}
          </List>
        )}
      </InfiniteLoader>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-500"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Loading more tasks...</span>
        </div>
      )}
    </div>
  );
}