import { TdmConnectionInspector, TdmMarkerInspector } from '../tdm-connection-inspector/tdm-connection-inspector';
import type { TdmSidebarContext } from '../tdm-sidebar.contract';
import styles from '../tdm-sidebar.module.sass';

export function TdmSidebarContextPanel({ context }: { context: TdmSidebarContext }) {
  if (context.kind === 'edge') {
    return <section className={styles.card}><TdmConnectionInspector sourceLabel={context.edge.sourceLabel} targetLabel={context.edge.targetLabel} statusTitle={context.edge.message || 'Conexão válida'} canAddRisk={context.edge.canAddRisk} canAddHypothesis={context.edge.canAddHypothesis} onAddRisk={context.onAddRisk} onAddHypothesis={context.onAddHypothesis} onDelete={context.onDelete} /></section>;
  }
  if (context.kind === 'marker') {
    return <section className={styles.card}><TdmMarkerInspector markerType={context.marker.markerType} sourceLabel={context.marker.sourceLabel} targetLabel={context.marker.targetLabel} markerText={context.marker.markerText} isEditingExisting={context.marker.isEditingExisting} onDraftChange={context.onDraftChange} onSubmit={context.onSubmit} onDelete={context.onDelete} /></section>;
  }
  return null;
}
