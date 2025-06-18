import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../services';

// Enhanced WebSocket hook with subscription management
export const useWebSocket = (eventType, callback, dependencies = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    wsService.on(eventType, memoizedCallback);
    
    return () => {
      wsService.off(eventType, memoizedCallback);
    };
  }, [eventType, memoizedCallback]);

  const sendMessage = useCallback((data) => {
    return wsService.send(data);
  }, []);

  return { sendMessage };
};

// Hook for managing WebSocket connection
export const useWebSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
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
export const useWebSocketSubscription = (topic, enabled = true) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

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
    const handleData = (newData) => {
      setData(newData);
    };

    const handleError = (errorData) => {
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
export const useEvmBlockUpdates = (enabled = true) => {
  return useWebSocketSubscription('blocks', enabled);
};

export const useEvmTransactionUpdates = (enabled = true) => {
  return useWebSocketSubscription('transactions', enabled);
};

export const useSubstrateBlockUpdates = (enabled = true) => {
  return useWebSocketSubscription('substrate_blocks', enabled);
};

export const useSubstrateEventUpdates = (enabled = true) => {
  return useWebSocketSubscription('substrate_events', enabled);
};

// Helper function to map topics to event types
const getEventTypeForTopic = (topic) => {
  const topicMap = {
    'blocks': 'newEvmBlock',
    'transactions': 'newEvmTransaction',
    'substrate_blocks': 'newSubstrateBlock', 
    'substrate_events': 'newSubstrateEvents'
  };
  return topicMap[topic];
};