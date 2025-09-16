export type CompletionState = "active" | "waiting" | "completed";

export type CompletionLifecycleName =
  | "activity.ready"
  | "activity.updated"
  | "activity.completed"
  | "activity.expired";

export type CompletionEvent =
  | { type: "activitiesChanged"; total: number; completable: number }
  | { type: "lifecycle"; name: CompletionLifecycleName }
  | { type: "timeout" }
  | { type: "abort" };

export type CompletionAction = "start_timer" | "stop_timer" | "complete" | "none";

export interface CompletionController {
  readonly state: CompletionState;
  readonly listSizeAtWait: number | null;
  transition(event: CompletionEvent): { state: CompletionState; actions: CompletionAction[] };
}

export function createCompletionController(initialState: CompletionState = "active"): CompletionController {
  let state: CompletionState = initialState;
  let listSizeAtWait: number | null = null;

  function transition(event: CompletionEvent) {
    const actions: CompletionAction[] = [];

    switch (event.type) {
      case "activitiesChanged": {
        const { total, completable } = event;
        if (state === "active") {
          if (completable === 0) {
            state = "waiting";
            listSizeAtWait = total;
            actions.push("start_timer");
          }
        } else if (state === "waiting") {
          const sizeChanged = listSizeAtWait !== null && total !== listSizeAtWait;
          if (sizeChanged || completable > 0) {
            state = "active";
            listSizeAtWait = null;
            actions.push("stop_timer");
          }
        }
        break;
      }
      case "lifecycle": {
        if (state !== "active") {
          state = "active";
          listSizeAtWait = null;
          actions.push("stop_timer");
        }
        break;
      }
      case "abort": {
        if (state !== "active") {
          state = "active";
          listSizeAtWait = null;
          actions.push("stop_timer");
        }
        break;
      }
      case "timeout": {
        if (state === "waiting") {
          state = "completed";
          listSizeAtWait = null;
          actions.push("stop_timer", "complete");
        }
        break;
      }
      default:
        actions.push("none");
    }

    return { state, actions };
  }

  return {
    get state() {
      return state;
    },
    get listSizeAtWait() {
      return listSizeAtWait;
    },
    transition,
  } as CompletionController;
}


