/**
 * Communications Domain Public API
 *
 * Handles iframe-to-parent communication via PostMessage
 */

// Components
export {
  IframeCommunicator,
  useCommunications,
} from "./components/iframe-communicator.client";

// Hooks
export { useHeightManager } from "./hooks/use-height-manager.client";
export { usePostMessageBridge } from "./hooks/use-postmessage-bridge.client";
export { useActivityEvents } from "./hooks/use-activity-events.client";

// Types
export type {
  PostMessageEvent,
  HeightChangeEvent,
  ActivityActivateEvent,
  PostMessageActivityEvent,
  AllPostMessageEvents,
} from "./shared/types";
