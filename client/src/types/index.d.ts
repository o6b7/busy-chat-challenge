// src/types.ts
export interface Resume {
  resumeId: string;
  originalName: string;
  candidateName: string;
  uploadedAt: string;
  email?: string;
  parsedText?: string;
}

export interface ChatMessage {
  role: "user" | "mcp";
  text: string;
  timestamp: Date;
}

export interface EmailLog {
  _id: string;
  to: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  createdAt: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  resumeId: string;
  originalName: string;
  uploadedAt: string;
}

export interface ChatResponse {
  answer: string;
  context?: string;
  confidence?: number;
}

export interface EmailSendResponse {
  success: boolean;
  sentTo: string;
  messageId?: string;
}