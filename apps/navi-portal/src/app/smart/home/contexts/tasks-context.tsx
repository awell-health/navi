"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task } from "@medplum/fhirtypes";
import { usePatientTasks } from "../hooks/use-patient-tasks";
import { PatientIdentifier } from "@awell-health/navi-core";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  selectedTaskId: string | null;
  setSelectedTask: (taskId: string | null) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  refetchTasks: () => void;
  getSelectedTask: () => Task | null;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: React.ReactNode;
  patientIdentifier: PatientIdentifier;
}

export function TasksProvider({ children, patientIdentifier }: TasksProviderProps) {
  const { tasks: initialTasks, loading, error, refetchTasks } = usePatientTasks(patientIdentifier);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Update local tasks when initial tasks change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    console.log("Updating Task", taskId, updates);
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      )
    );
  };

  const getSelectedTask = (): Task | null => {
    return tasks.find((task) => task.id === selectedTaskId) || null;
  };

  const setSelectedTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
  };

  const value: TasksContextType = {
    tasks,
    loading,
    error,
    selectedTaskId,
    setSelectedTask,
    updateTask,
    refetchTasks,
    getSelectedTask,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
