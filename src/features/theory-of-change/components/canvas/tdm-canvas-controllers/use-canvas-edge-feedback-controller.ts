import { useCallback, useState } from 'react';

const RECENT_EDGE_FEEDBACK_MS = 1800;

export function useCanvasEdgeFeedbackController() {
  const [recentlyUpdatedEdgeIds, setRecentlyUpdatedEdgeIds] = useState<Set<string>>(() => new Set());

  const markEdgeRecentlyUpdated = useCallback((edgeId: string) => {
    setRecentlyUpdatedEdgeIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(edgeId);
      return nextIds;
    });

    window.setTimeout(() => {
      setRecentlyUpdatedEdgeIds((currentIds) => {
        if (!currentIds.has(edgeId)) {
          return currentIds;
        }

        const nextIds = new Set(currentIds);
        nextIds.delete(edgeId);
        return nextIds;
      });
    }, RECENT_EDGE_FEEDBACK_MS);
  }, []);

  return { recentlyUpdatedEdgeIds, markEdgeRecentlyUpdated };
}
