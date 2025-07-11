/**
 * Message Activity Data Structure
 */
export interface MessageActivityData {
  id: string;
  subject: string;
  body: string;
  format?: "HTML" | "MARKDOWN" | "SLATE";
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}
