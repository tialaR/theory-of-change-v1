'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import {
  buildFlowReportContent,
  buildFlowReportContentForEdge,
  getCausalFamily,
  getCausalFamilyForEdge
} from '../result-view-utils';

export function useResultViewFocusController({
  nodes,
  edges,
  shouldReduceMotion
}: {
  nodes: TdmNode[];
  edges: TdmEdge[];
  shouldReduceMotion: boolean | null;
}) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const flowInspectorSlotRef = useRef<HTMLDivElement>(null);
  const flowInspectorMobileRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerCardRef = useCallback((nodeId: string, element: HTMLElement | null) => {
    if (element) {
      cardRefs.current.set(nodeId, element);
      return;
    }

    cardRefs.current.delete(nodeId);
  }, []);

  const causalFamily = useMemo(() => {
    if (focusedNodeId) {
      return getCausalFamily(focusedNodeId, nodes, edges);
    }

    if (focusedEdgeId) {
      return getCausalFamilyForEdge(focusedEdgeId, nodes, edges);
    }

    return null;
  }, [edges, focusedEdgeId, focusedNodeId, nodes]);

  const relatedNodeIds = useMemo(
    () => causalFamily?.relatedNodeIds ?? new Set<string>(),
    [causalFamily]
  );
  const relatedEdgeIds = useMemo(
    () => causalFamily?.relatedEdgeIds ?? new Set<string>(),
    [causalFamily]
  );

  const flowInspectorContent = useMemo(() => {
    if (focusedEdgeId) {
      return buildFlowReportContentForEdge(focusedEdgeId, nodes, edges);
    }

    if (focusedNodeId) {
      return buildFlowReportContent(focusedNodeId, nodes, edges);
    }

    return null;
  }, [edges, focusedEdgeId, focusedNodeId, nodes]);

  const edgeEndpointIds = useMemo(() => {
    if (!focusedEdgeId) {
      return new Set<string>();
    }

    const edge = edges.find((candidate) => candidate.id === focusedEdgeId);

    if (!edge) {
      return new Set<string>();
    }

    return new Set([edge.source, edge.target]);
  }, [edges, focusedEdgeId]);

  const clearFocus = useCallback(() => {
    setFocusedNodeId(null);
    setFocusedEdgeId(null);
  }, []);

  const scrollFocusTargetIntoView = useCallback(
    (element: HTMLElement | null | undefined) => {
      if (!element) {
        return;
      }

      window.requestAnimationFrame(() => {
        element.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      });
    },
    [shouldReduceMotion]
  );

  const focusRelatedConnectionForNode = useCallback(
    (nodeId: string) => {
      const family = getCausalFamily(nodeId, nodes, edges);
      const partnerId = family.outgoingIds[0] ?? family.incomingIds[0] ?? null;
      const partnerElement = partnerId ? cardRefs.current.get(partnerId) : null;
      const selfElement = cardRefs.current.get(nodeId);
      const desktopInspector = flowInspectorSlotRef.current;
      const mobileInspector = flowInspectorMobileRef.current;
      const inspectorVisible =
        desktopInspector && window.getComputedStyle(desktopInspector).display !== 'none'
          ? desktopInspector
          : mobileInspector;

      scrollFocusTargetIntoView(partnerElement ?? selfElement);

      if (inspectorVisible && family.relatedEdgeIds.size > 0) {
        window.requestAnimationFrame(() => {
          scrollFocusTargetIntoView(inspectorVisible);
        });
      }
    },
    [edges, nodes, scrollFocusTargetIntoView]
  );

  const focusRelatedConnectionForEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((candidate) => candidate.id === edgeId);

      if (!edge) {
        return;
      }

      const targetElement = cardRefs.current.get(edge.target) ?? cardRefs.current.get(edge.source);
      scrollFocusTargetIntoView(targetElement);
    },
    [edges, scrollFocusTargetIntoView]
  );

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setFocusedEdgeId(null);

      if (focusedNodeId === nodeId) {
        setFocusedNodeId(null);
        return;
      }

      setFocusedNodeId(nodeId);
      focusRelatedConnectionForNode(nodeId);
    },
    [focusRelatedConnectionForNode, focusedNodeId]
  );

  const handleSelectEdge = useCallback(
    (edgeId: string) => {
      setFocusedNodeId(null);

      if (focusedEdgeId === edgeId) {
        setFocusedEdgeId(null);
        return;
      }

      setFocusedEdgeId(edgeId);
      focusRelatedConnectionForEdge(edgeId);
    },
    [focusRelatedConnectionForEdge, focusedEdgeId]
  );

  return {
    focusedNodeId,
    focusedEdgeId,
    relatedNodeIds,
    relatedEdgeIds,
    flowInspectorContent,
    edgeEndpointIds,
    flowInspectorSlotRef,
    flowInspectorMobileRef,
    cardRefs,
    registerCardRef,
    handleSelectNode,
    handleSelectEdge,
    clearFocus
  };
}
