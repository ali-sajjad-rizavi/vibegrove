import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  WebSocketMessage,
  FileList,
  ImportGraph,
  SessionList,
  FileCreated,
  FileModified,
  FileDeleted,
  FileContentResponse,
} from '@shared/types';

interface UseWebSocketOptions {
  onFileList?: (data: FileList) => void;
  onImportGraph?: (data: ImportGraph) => void;
  onSessionList?: (data: SessionList) => void;
  onFileCreated?: (data: FileCreated) => void;
  onFileModified?: (data: FileModified) => void;
  onFileDeleted?: (data: FileDeleted) => void;
  onFileContent?: (data: FileContentResponse) => void;
}

interface UseWebSocketReturn {
  send: (message: WebSocketMessage) => void;
  terminalData: string;
  connected: boolean;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [terminalData, setTerminalData] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Store options in a ref to avoid reconnection loops
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let isMounted = true;

    function connect() {
      // Don't reconnect if already connected or component unmounted
      if (wsRef.current?.readyState === WebSocket.OPEN || !isMounted) {
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnected(true);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          const opts = optionsRef.current;

          switch (message.type) {
            case 'file:list':
              opts.onFileList?.(message as FileList);
              break;
            case 'import:graph':
              opts.onImportGraph?.(message as ImportGraph);
              break;
            case 'session:list':
              opts.onSessionList?.(message as SessionList);
              break;
            case 'file:created':
              opts.onFileCreated?.(message as FileCreated);
              break;
            case 'file:modified':
              opts.onFileModified?.(message as FileModified);
              break;
            case 'file:deleted':
              opts.onFileDeleted?.(message as FileDeleted);
              break;
            case 'file:content:response':
              opts.onFileContent?.(message as FileContentResponse);
              break;
            case 'terminal:output':
              setTerminalData((prev) => prev + message.data);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnected(false);
        wsRef.current = null;
        console.log('WebSocket disconnected');

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isMounted) {
            console.log('Attempting to reconnect...');
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { send, terminalData, connected };
}
