import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  size,
  arrow,
  Placement,
  VirtualElement,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface UseFloatingLinkPositionProps {
  isOpen: boolean;
  selectionRect: DOMRect | null;
  validationError: string | null;
  forceSaveEnabled: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Custom hook for managing floating UI positioning with stable placement
 */
export function useFloatingLinkPosition({
  isOpen,
  selectionRect,
  onOpenChange,
}: UseFloatingLinkPositionProps) {
  const arrowRef = useRef(null);
  const stablePlacement = useRef<Placement | null>(null);
  const lastSelectionKey = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // NOTE: create a unique key for the current selection position
  const selectionKey = useMemo(() => {
    if (!selectionRect) return null;
    return `${Math.round(selectionRect.top)}-${Math.round(selectionRect.left)}-${Math.round(selectionRect.width)}-${Math.round(selectionRect.height)}`;
  }, [selectionRect]);

  // NOTE: detect if this is a new selection position
  const isNewSelection = useMemo(() => {
    return selectionKey !== lastSelectionKey.current;
  }, [selectionKey]);

  // NOTE: create virtual element for Floating UI
  const virtualElement: VirtualElement | null = useMemo(() => {
    return selectionRect
      ? {
          getBoundingClientRect: () => selectionRect,
        }
      : null;
  }, [selectionRect]);

  // NOTE: calculate placement for new selections
  const placement: Placement = useMemo(() => {
    if (!selectionRect) return 'bottom';

    // NOTE: if this is a new selection, recalculate placement
    if (isNewSelection) {
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - selectionRect.bottom;
      const spaceAbove = selectionRect.top;

      // NOTE: estimate required space
      const minSpaceNeeded = 250;

      let calculatedPlacement: Placement = 'bottom';

      if (spaceBelow >= minSpaceNeeded) {
        calculatedPlacement = 'bottom';
      } else if (spaceAbove >= minSpaceNeeded) {
        calculatedPlacement = 'top';
      } else {
        calculatedPlacement = spaceBelow > spaceAbove ? 'bottom' : 'top';
      }

      stablePlacement.current = calculatedPlacement;
      return calculatedPlacement;
    }

    return stablePlacement.current || 'bottom';
  }, [selectionRect, isNewSelection]);

  // NOTE: reset when editor closes or selection changes
  useEffect(() => {
    if (!isOpen) {
      stablePlacement.current = null;
      lastSelectionKey.current = null;
      setIsReady(false);
    } else if (isNewSelection && selectionKey) {
      // NOTE: new selection detected, reset ready state
      setIsReady(false);
      lastSelectionKey.current = selectionKey;
    }
  }, [isOpen, isNewSelection, selectionKey]);

  // NOTE: floating UI configuration
  const floating = useFloating({
    placement,
    open: isOpen,
    strategy: 'fixed',
    onOpenChange,
    middleware: [
      offset(12),
      shift({
        padding: 20,
        crossAxis: true,
        limiter: {
          fn: ({ x, y }) => ({ x, y }),
        },
      }),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          const safeWidth = Math.min(480, availableWidth - 40);
          const maxHeight = Math.min(350, availableHeight - 60);

          Object.assign(elements.floating.style, {
            maxWidth: `${safeWidth}px`,
            minWidth: '300px',
            maxHeight: `${maxHeight}px`,
            overflowY: 'hidden',
            boxSizing: 'border-box',
          });
        },
      }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: (reference, floating, update) => {
      const cleanup = autoUpdate(reference, floating, update, {
        elementResize: true,
        animationFrame: false,
      });
      return cleanup;
    },
  });

  // NOTE: handle dismiss interactions
  const dismiss = useDismiss(floating.context, {
    outsidePressEvent: 'mousedown',
  });

  const { getFloatingProps } = useInteractions([dismiss]);

  // NOTE: set reference element and mark as ready when positioned
  useEffect(
    function setVirtualElementAsReference() {
      if (virtualElement && floating.refs.setReference) {
        floating.refs.setReference(virtualElement);

        // NOTE: mark as ready only after reference is set and positioned
        if (floating.isPositioned) {
          setIsReady(true);
        }
      }
    },
    [virtualElement, floating.refs, floating.isPositioned]
  );

  // NOTE: only show when truly ready (positioned and not transitioning between selections)
  const shouldShow = isOpen && isReady && !isNewSelection && floating.isPositioned;

  return {
    ...floating,
    arrowRef,
    getFloatingProps,
    placement,
    shouldShow,
  };
}
