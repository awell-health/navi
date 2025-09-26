"use client";

import { useTasks } from "../contexts/tasks-context";
import { useTaskFiltering } from "../hooks/use-task-filtering";
import { TaskCard } from "./task-card";
import { TaskCardSkeleton } from "./task-card-skeleton";
import { TaskFilters } from "./task-filters";
import { AddTaskDropdown } from "./add-task-dropdown";
import { Button } from "../../../../components/ui";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";
import { ApolloProvider } from "@/lib/awell-client/provider";
import { TaskView } from "./task-view";


  export function TaskList() {
  const { tasks, loading, error, refetchTasks, selectedTaskId, setSelectedTask } = useTasks();

  const {
    filteredTasks,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    availableStatuses,
  } = useTaskFiltering(tasks);


  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 font-medium mb-2">Error Loading Tasks</div>
        <p className="text-gray-600 text-sm">
          {error.message || "Unable to load patient tasks"}
        </p>
      </div>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-900 font-medium mb-2">No Tasks Found</div>
        <p className="text-gray-600 text-sm">
          This patient currently has no active tasks.
        </p>
      </div>
    );
  }

  return (
    <>
      <ApolloProvider>
      {!selectedTaskId && <div className="space-y-2">
        <div className="flex justify-between items-center">
          <TaskFilters
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            availableStatuses={availableStatuses}
          />
          <div className="flex items-center gap-1">
            <AddTaskDropdown 
              disabled={loading}
              tasks={tasks}
              onTaskAdded={refetchTasks}
            />
            <Button size="icon" variant="ghost" onClick={refetchTasks} title="Refresh Tasks">
              <RefreshCcwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <TaskCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task.id ?? null)}
                />
              ))}
            </div>
          )}
        
      </div>}
      {selectedTaskId && (
        <TaskView />
      )}
      </ApolloProvider>
    </>
  );
}
