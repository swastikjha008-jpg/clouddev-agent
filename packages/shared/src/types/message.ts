export type MessageRole = "user" | "agent" | "system";

/**
 * Controls whether the agent loop pauses after sending this message.
 *  - BLOCK: agent pauses until the user replies (task moves to BLOCKED_ON_USER)
 *  - DONE:  informational, agent keeps going
 *  - NONE:  no interaction implied (plain status update)
 */
export type BlockOnUserResponse = "BLOCK" | "DONE" | "NONE";

export interface Attachment {
  id: string;
  /** S3 key/URL. */
  url: string;
  contentType: string;
  fileName: string;
  sizeBytes: number;
}

export interface Message {
  id: string;
  taskId: string;
  role: MessageRole;
  content: string;
  blockOnUserResponse: BlockOnUserResponse;
  attachments: Attachment[];
  createdAt: string;
}
