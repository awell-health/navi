"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { 
  useStartTrackMutation, 
  AdHocTracksByCareflowQuery,
  TracksWithCareflowPayload,
  useAdHocTracksByCareflowLazyQuery
} from "../../../../lib/awell-client/generated/graphql";
import { ApolloError } from "@apollo/client";
import { Task } from "@medplum/fhirtypes";

interface AddTaskDropdownProps {
  tasks: Task[];
  disabled?: boolean;
  onTaskAdded: () => void;
}

export function AddTaskDropdown({ tasks, disabled = false, onTaskAdded }: AddTaskDropdownProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [allQueryResults, setAllQueryResults] = useState<Array<{
    pathwayId: string;
    data: AdHocTracksByCareflowQuery | null;
    loading: boolean;
    error: ApolloError | null;
  }>>([]);

  const [addTrack] = useStartTrackMutation();

  // Extract unique pathway IDs from tasks
  const pathwayIds = Array.from(new Set(
    tasks
      .map(task => {
        const awellTaskExtension = task.extension?.find(
          ext => ext.url === "https://awellhealth.com/fhir/StructureDefinition/awell-task"
        );
        
        if (awellTaskExtension?.extension) {
          const pathwayIdExtension = awellTaskExtension.extension.find(
            ext => ext.url === "pathway-id"
          );
          return pathwayIdExtension?.valueString;
        }
        return undefined;
      })
      .filter((id): id is string => id !== undefined)
  ));

  const [executeQuery] = useAdHocTracksByCareflowLazyQuery();

  // Execute queries for each pathway ID
  useEffect(() => {
    if (pathwayIds.length > 0) {
      // Initialize results array for each pathway ID
      setAllQueryResults(pathwayIds.map(pathwayId => ({
        pathwayId,
        data: null,
        loading: true,
        error: null
      })));

      // Execute all queries in parallel using Promise.all
      const executeAllQueries = async () => {
        try {
          const queryPromises = pathwayIds.map(async (pathwayId) => {
            
            const result = await executeQuery({
              variables: {
                careflow_id: pathwayId
              }
            });
            return { pathwayId, result };
          });

          const results = await Promise.all(queryPromises);
          
          // Update all results at once
          setAllQueryResults(prev => prev.map(item => {
            const result = results.find(r => r.pathwayId === item.pathwayId);
            return result ? {
              ...item,
              data: result.result.data || null,
              loading: false,
              error: result.result.error || null
            } : item;
          }));
        } catch (error) {
          console.error("Error executing queries:", error);
        }
      };

      executeAllQueries();
    }
  }, [pathwayIds.join(',')]); // Use pathwayIds as string to avoid infinite loop

  // Merge all tracks from all query results into one list
    const allTracks: TracksWithCareflowPayload[] = allQueryResults
    .filter(result => result.data?.adHocTracksByCareflow?.tracks)
    .flatMap(result => result.data?.adHocTracksByCareflow?.tracks || [])
    .filter((track): track is TracksWithCareflowPayload => track !== null && track !== undefined);

  const handleAddTask = async (track: TracksWithCareflowPayload) => {
    
    if (track) {
      setIsAdding(true);
      await addTrack({
        variables: {
          input: {
            track_definition_id: track.id,
            careflow_id: track.careflowId
          }
        }
      });

      setTimeout(() => {
        setIsAdding(false);
        onTaskAdded();
      }, 1000);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || isAdding}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? <><Loader2 className="w-3 h-3 animate-spin" /> Adding...</> : <><PlusIcon className="w-3 h-3" /> Add Task</>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48 max-w-72 text-xs">
        {allTracks.map((track) => { 
          return (
          <DropdownMenuItem
            key={track.id}
            onClick={() => handleAddTask(track)}
            disabled={isAdding}
            className="flex flex-col items-start gap-1"
          >
            <span className="text-xs flex items-center gap-0.5"><PlusIcon className="w-3 h-3" /> {track.title}</span>
          </DropdownMenuItem>
        )})}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
