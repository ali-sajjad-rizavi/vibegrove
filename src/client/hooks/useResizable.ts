import { useState, useCallback, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

interface UseResizableOptions {
  initialSize?: Size;
  minSize?: Size;
  maxSize?: Size;
}

interface UseResizableReturn {
  size: Size;
  isResizing: boolean;
  handleResizeStart: (edge: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => (e: React.MouseEvent) => void;
}

export function useResizable(options: UseResizableOptions = {}): UseResizableReturn {
  const {
    initialSize = { width: 350, height: 300 },
    minSize = { width: 250, height: 200 },
    maxSize = { width: 800, height: 600 },
  } = options;

  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startSize = useRef<Size>(size);
  const startPos = useRef({ x: 0, y: 0 });

  const handleResizeStart = useCallback((edge: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startSize.current = { ...size };
      startPos.current = { x: e.clientX, y: e.clientY };
      setIsResizing(true);

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const dx = moveEvent.clientX - startPos.current.x;
        const dy = moveEvent.clientY - startPos.current.y;

        let newWidth = startSize.current.width;
        let newHeight = startSize.current.height;

        if (edge.includes('e')) {
          newWidth = startSize.current.width + dx;
        }
        if (edge.includes('w')) {
          newWidth = startSize.current.width - dx;
        }
        if (edge.includes('s')) {
          newHeight = startSize.current.height + dy;
        }
        if (edge.includes('n')) {
          newHeight = startSize.current.height - dy;
        }

        setSize({
          width: Math.min(maxSize.width, Math.max(minSize.width, newWidth)),
          height: Math.min(maxSize.height, Math.max(minSize.height, newHeight)),
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [size, minSize, maxSize]);

  return {
    size,
    isResizing,
    handleResizeStart,
  };
}
