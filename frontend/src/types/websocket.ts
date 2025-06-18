export interface WebSocketMessage {
  type: string;
  data?: any;
  topic?: string;
  message?: string;
}

export interface WebSocketConnectionStatus {
  connected: boolean;
  subscriptions: string[];
  reconnectAttempts: number;
}

export type WebSocketEventType =
  | "connected"
  | "disconnected"
  | "message"
  | "error"
  | "newEvmBlock"
  | "newEvmTransaction"
  | "newSubstrateBlock"
  | "newSubstrateEvents"
  | "blockUpdate"
  | "transactionUpdate"
  | "substrateBlockUpdate"
  | "substrateEventUpdate"
  | "success"
  | "wsError";
