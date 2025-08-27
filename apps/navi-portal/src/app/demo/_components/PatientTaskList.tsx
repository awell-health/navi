"use client";

import { useMedplum } from "@/domains/medplum/MedplumClientProvider";
import { useStytchMember, useStytchOrganization } from "@stytch/nextjs/b2b";
import { useState, useEffect } from "react";
import type { Task } from "@medplum/fhirtypes";
import { Loader2, Calendar, User, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientTaskListProps {
  patientId?: string;
}

export function PatientTaskList({ patientId }: PatientTaskListProps) {
  const { member } = useStytchMember();
  const { organization } = useStytchOrganization();
  const { getTasks, getTasksForPatient, isLoading: medplumLoading, error } = useMedplum();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!member || !organization) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please authenticate with Stytch to view patient tasks.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskData = patientId 
          ? await getTasksForPatient(patientId)
          : await getTasks();
        setTasks(taskData);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!medplumLoading) {
      fetchTasks();
    }
  }, [patientId, getTasks, getTasksForPatient, medplumLoading]);

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aDate = new Date(a.meta?.lastUpdated || a.authoredOn || 0);
    const bDate = new Date(b.meta?.lastUpdated || b.authoredOn || 0);
    return sortOrder === "desc" ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
  });

  const uniqueStatuses = [...new Set(tasks.map(task => task.status))];

  if (loading || medplumLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[450px] mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Patient Tasks</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="text-sm border border-gray-300 rounded px-2 py-1 flex items-center gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortOrder === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-600">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">
                    {task.description || task.code?.text || "Untitled Task"}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    task.status === "completed" ? "bg-green-100 text-green-800" :
                    task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                    task.status === "requested" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  )}>
                    {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                  </span>
                </div>
                
                {task.authoredOn && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(task.authoredOn).toLocaleDateString()}
                  </div>
                )}
                
                {task.owner && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    Assigned to: {task.owner.display || "Unknown"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
