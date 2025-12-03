"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";

type SetItems<T> = Dispatch<SetStateAction<T[]>>;

export function useDragReorder<T>(
  _items: T[],
  setItems: SetItems<T>,
  options?: { onReorder?: (items: T[]) => void }
) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const reset = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;

    if (from === null || to === null || from === to) {
      reset();
      return;
    }

    setItems((prev) => {
      if (
        from < 0 ||
        to < 0 ||
        from >= prev.length ||
        to >= prev.length ||
        from === to
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      options?.onReorder?.(next);
      return next;
    });

    reset();
  };

  return {
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
}
