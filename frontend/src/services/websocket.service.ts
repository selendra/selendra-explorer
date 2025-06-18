import { APP_CONFIG } from '../config/app.config';
import { WebSocketMessage, WebSocketConnectionStatus, WebSocketEventType } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnected: boolean = false;

  constructor() {
    this.url = APP_CONFIG.api.websocketUrl;
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected', null);
        
        // Re-subscribe to previous subscriptions after reconnection
        this.resubscribeAll();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.emit('message', message);
          
          // Handle specific message types based on the backend format
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.emit('error', { type: 'parse_error', message: (error as Error).message });
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected', null);
        this.reconnect();
      };

      this.ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        this.emit('error', { type: 'connection_error', error });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.emit('error', { type: 'connection_failed', message: (error as Error).message });
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`WebSocket reconnect attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Subscribe to a specific topic
  public subscribe(topic: string): boolean {
    if (!this.isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return false;
    }

    const message: WebSocketMessage = {
      type: 'subscribe',
      topic: topic
    };

    this.send(message);
    this.subscriptions.add(topic);
    console.log(`Subscribed to topic: ${topic}`);
    return true;
  }

  // Unsubscribe from a specific topic
  public unsubscribe(topic: string): boolean {
    if (!this.isConnected) {
      console.warn('Cannot unsubscribe: WebSocket not connected');
      return false;
    }

    const message: WebSocketMessage = {
      type: 'unsubscribe',
      topic: topic
    };

    this.send(message);
    this.subscriptions.delete(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
    return true;
  }

  // Unsubscribe from all topics
  public unsubscribeAll(): void {
    Array.from(this.subscriptions).forEach(topic => {
      this.unsubscribe(topic);
    });
  }

  // Re-subscribe to all previous subscriptions (used after reconnection)
  private resubscribeAll(): void {
    if (this.subscriptions.size > 0) {
      console.log('Re-subscribing to previous subscriptions...');
      Array.from(this.subscriptions).forEach(topic => {
        const message: WebSocketMessage = {
          type: 'subscribe',
          topic: topic
        };
        this.send(message);
      });
    }
  }

  // Handle incoming messages based on type
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'block_update':
        this.emit('newEvmBlock', message.data);
        this.emit('blockUpdate', message.data);
        break;
      
      case 'transaction_update':
        this.emit('newEvmTransaction', message.data);
        this.emit('transactionUpdate', message.data);
        break;
      
      case 'substrate_block_update':
        this.emit('newSubstrateBlock', message.data);
        this.emit('substrateBlockUpdate', message.data);
        break;
      
      case 'substrate_event_update':
        this.emit('newSubstrateEvents', message.data);
        this.emit('substrateEventUpdate', message.data);
        break;
      
      case 'success':
        this.emit('success', message);
        console.log('WebSocket success:', message.message);
        break;
      
      case 'error':
        this.emit('wsError', message);
        console.error('WebSocket error:', message.message);
        break;
      
      default:
        // Emit the original message type as well
        this.emit(message.type, message.data || message);
        break;
    }
  }

  public send(data: WebSocketMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
  }

  // Get current connection status
  public getConnectionStatus(): WebSocketConnectionStatus {
    return {
      connected: this.isConnected,
      subscriptions: Array.from(this.subscriptions),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  public on(event: WebSocketEventType, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  public off(event: WebSocketEventType, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  private emit(event: WebSocketEventType | any, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }
}

export const wsService = new WebSocketService();