import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../services';
import { WebSocketConnectionStatus, WebSocketEventType } from '../types';

// Enhanced WebSocket hook with subscription management
export const useWebSocket = (
  eventType: WebSocketEventType, 
  callback: (data: any) => void, 
  dependencies: any[] = []
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    wsService.on(eventType, memoizedCallback);
    
    return () => {
      wsService.off(eventType, memoizedCallback);
    };
  }, [eventType, memoizedCallback]);

  const sendMessage = useCallback((data: any) => {
    return wsService.send(data);
  }, []);

  return { sendMessage };
};

// Hook for managing WebSocket connection
export const useWebSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>({
    connected: false,
    subscriptions: [],
    reconnectAttempts: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(wsService.getConnectionStatus());
    };

    // Listen for connection events
    wsService.on('connected', updateStatus);
    wsService.on('disconnected', updateStatus);
    
    // Initial status
    updateStatus();

    return () => {
      wsService.off('connected', updateStatus);
      wsService.off('disconnected', updateStatus);
    };
  }, []);

  const connect = useCallback(() => {
    wsService.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  return {
    ...connectionStatus,
    connect,
    disconnect
  };
};

// Hook for managing subscriptions
export const useWebSocketSubscription = (topic: string, enabled: boolean = true) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(() => {
    if (wsService.subscribe(topic)) {
      setIsSubscribed(true);
      setError(null);
    } else {
      setError('Failed to subscribe - WebSocket not connected');
    }
  }, [topic]);

  const unsubscribe = useCallback(() => {
    if (wsService.unsubscribe(topic)) {
      setIsSubscribed(false);
      setData(null);
    }
  }, [topic]);

  // Handle incoming data for this topic
  useEffect(() => {
    const handleData = (newData: any) => {
      setData(newData);
    };

    const handleError = (errorData: { message?: string }) => {
      setError(errorData.message || 'WebSocket error occurred');
    };

    // Map topics to their corresponding event types
    const eventType = getEventTypeForTopic(topic);
    if (eventType) {
      wsService.on(eventType, handleData);
      wsService.on('wsError', handleError);
      
      return () => {
        wsService.off(eventType, handleData);
        wsService.off('wsError', handleError);
      };
    }
  }, [topic]);

  // Auto-subscribe/unsubscribe based on enabled flag
  useEffect(() => {
    if (enabled && !isSubscribed) {
      subscribe();
    } else if (!enabled && isSubscribed) {
      unsubscribe();
    }

    return () => {
      if (isSubscribed) {
        unsubscribe();
      }
    };
  }, [enabled, isSubscribed, subscribe, unsubscribe]);

  return {
    isSubscribed,
    data,
    error,
    subscribe,
    unsubscribe
  };
};

// Specific hooks for different data types
export const useEvmBlockUpdates = (enabled: boolean = true) => {
  return useWebSocketSubscription('blocks', enabled);
};

export const useEvmTransactionUpdates = (enabled: boolean = true) => {
  return useWebSocketSubscription('transactions', enabled);
};

export const useSubstrateBlockUpdates = (enabled: boolean = true) => {
  return useWebSocketSubscription('substrate_blocks', enabled);
};

export const useSubstrateEventUpdates = (enabled: boolean = true) => {
  return useWebSocketSubscription('substrate_events', enabled);
};

// Helper function to map topics to event types
const getEventTypeForTopic = (topic: string): WebSocketEventType | null => {
  const topicMap: Record<string, WebSocketEventType> = {
    'blocks': 'newEvmBlock',
    'transactions': 'newEvmTransaction',
    'substrate_blocks': 'newSubstrateBlock', 
    'substrate_events': 'newSubstrateEvents'
  };
  return topicMap[topic] || null;
};