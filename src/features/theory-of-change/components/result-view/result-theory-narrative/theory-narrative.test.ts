/**
 * Deterministic narrative motor tests — V2.3.
 * Run with: npx --yes tsx src/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.test.ts
 */

import assert from 'node:assert/strict';
import { exampleTheory } from '@/features/theory-of-change/data/example-theory';
import { createEdge } from '@/features/theory-of-change/utils/create-edge';
import { createNode } from '@/features/theory-of-change/utils/create-node';
import { buildTheoryNarrativeDocument } from './theory-narrative.mapper';
import { normalizeForCompare } from './theory-narrative.normalizers';

function collectTexts(document: NonNullable<ReturnType<typeof buildTheoryNarrativeDocument>>): string[] {
  const texts: string[] = [];
  document.executiveSummary.forEach((item) => texts.push(item.text));
  document.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.paragraphs?.forEach((item) => texts.push(item.text));
      section.callouts?.forEach((item) => texts.push(item.text));
    });
  });
  return texts;
}

function collectSourceRefs(document: NonNullable<ReturnType<typeof buildTheoryNarrativeDocument>>) {
  const refs: Array<{ kind: string; id?: string }> = [];
  document.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.sourceRefs.forEach((ref) => refs.push(ref));
      section.paragraphs?.forEach((paragraph) => {
        paragraph.sourceRefs.forEach((ref) => refs.push(ref));
      });
      section.callouts?.forEach((callout) => {
        callout.sourceRefs.forEach((ref) => refs.push(ref));
      });
    });
  });
  return refs;
}

function run() {
  // 1. Macro has at least 4 pages; references last and exclusive
  const macro = buildTheoryNarrativeDocument(null, exampleTheory.nodes, exampleTheory.edges);
  assert.ok(macro);
  assert.equal(macro.scope, 'macro');
  assert.ok(macro.pages.length >= 4, 'macro must have at least 4 pages');
  assert.equal(macro.pages.at(-1)?.kind, 'references');
  assert.equal(macro.pages.at(-1)?.sections.every((section) => (section.paragraphs?.length ?? 0) === 0), true);

  // 2. Every non-empty title appears
  const texts = collectTexts(macro).join('\n').toLocaleLowerCase('pt-BR');
  exampleTheory.nodes.forEach((node) => {
    assert.ok(texts.includes(node.title.toLocaleLowerCase('pt-BR')), `missing title ${node.title}`);
  });

  // 3. Risks only on allowed transitions; hypothesis only product→result
  const riskCallouts = macro.pages.flatMap((page) =>
    page.sections.flatMap((section) => section.callouts?.filter((item) => item.kind === 'risk') ?? [])
  );
  const hypothesisCallouts = macro.pages.flatMap((page) =>
    page.sections.flatMap((section) => section.callouts?.filter((item) => item.kind === 'hypothesis') ?? [])
  );
  assert.equal(riskCallouts.length, 2);
  assert.equal(hypothesisCallouts.length, 1);
  assert.ok(
    riskCallouts.every((item) =>
      exampleTheory.edges.some((edge) => edge.id === item.edgeId && edge.markerType === 'risk')
    )
  );
  assert.ok(
    hypothesisCallouts.every((item) =>
      exampleTheory.edges.some((edge) => edge.id === item.edgeId && edge.markerType === 'hypothesis')
    )
  );

  // 4. Conclusion does not claim result achieved
  const conclusion = collectTexts(macro).find((text) => text.includes('Em síntese'));
  assert.ok(conclusion);
  assert.ok(conclusion.includes('não constitui comprovação'));
  assert.equal(/comprova que o resultado foi alcançado/i.test(conclusion), false);

  // 5. Source refs exist
  const refs = collectSourceRefs(macro);
  assert.ok(refs.some((ref) => ref.kind === 'node'));
  assert.ok(refs.some((ref) => ref.kind === 'edge' || ref.kind === 'risk' || ref.kind === 'hypothesis'));

  // 6. Scoped contains only related path
  const selectedNode = exampleTheory.nodes.find((node) => node.title === 'Equipe técnica');
  assert.ok(selectedNode);
  const scoped = buildTheoryNarrativeDocument(
    { type: 'node', id: selectedNode.id },
    exampleTheory.nodes,
    exampleTheory.edges
  );
  assert.ok(scoped);
  assert.equal(scoped.scope, 'scoped');
  assert.ok(scoped.pages.length >= 1);
  assert.equal(scoped.pages.some((page) => page.kind === 'references'), false);
  const scopedText = collectTexts(scoped).join('\n');
  assert.ok(scopedText.includes('Equipe técnica'));
  assert.ok(scopedText.includes('Formação de professores'));
  assert.equal(scopedText.includes('Acompanhamento nas escolas'), false);

  // 7. Deduplication
  const dupNode = createNode({
    title: 'Recurso único',
    stage: 'input',
    description: 'Mesmo texto.',
    advancedDetails: 'Mesmo texto.',
    shortNotes: 'Mesmo texto.',
    x: 0,
    y: 0
  });
  const dupDoc = buildTheoryNarrativeDocument(null, [dupNode], []);
  assert.ok(dupDoc);
  const dupJoined = collectTexts(dupDoc).join('\n');
  const occurrences = dupJoined.split(normalizeForCompare('Mesmo texto')).length - 1;
  assert.ok(occurrences <= 2, 'duplicated semantic fields should be collapsed');

  // 8. Branch and convergence language
  const a = createNode({ title: 'Insumo A', stage: 'input', x: 0, y: 0 });
  const b = createNode({ title: 'Insumo B', stage: 'input', x: 0, y: 40 });
  const act = createNode({ title: 'Atividade X', stage: 'activity', x: 100, y: 20 });
  const out = createNode({ title: 'Produto Y', stage: 'output', x: 200, y: 20 });
  const res = createNode({ title: 'Resultado Z', stage: 'outcome', x: 300, y: 20 });
  const branchDoc = buildTheoryNarrativeDocument(
    null,
    [a, b, act, out, res],
    [
      createEdge({ source: a.id, target: act.id, sourceStage: 'input', targetStage: 'activity' }),
      createEdge({ source: b.id, target: act.id, sourceStage: 'input', targetStage: 'activity' }),
      createEdge({ source: act.id, target: out.id, sourceStage: 'activity', targetStage: 'output' }),
      createEdge({ source: out.id, target: res.id, sourceStage: 'output', targetStage: 'outcome' })
    ]
  );
  assert.ok(branchDoc);
  const branchText = collectTexts(branchDoc).join('\n');
  assert.ok(branchText.includes('convergem') || branchText.includes('converg'));

  // 9. Disconnected node
  const lone = createNode({ title: 'Bloco isolado', stage: 'activity', x: 0, y: 0 });
  const loneDoc = buildTheoryNarrativeDocument(null, [lone], []);
  assert.ok(loneDoc);
  assert.ok(collectTexts(loneDoc).join('\n').includes('ainda não integrado'));

  // 10. Forbidden invention words absent from generated body (except disclaimer)
  const forbidden = ['garante', 'comprova', 'produz necessariamente', 'evidência mostra'];
  const body = collectTexts(macro).join('\n').toLocaleLowerCase('pt-BR');
  forbidden.forEach((word) => {
    if (word === 'comprova') {
      assert.ok(body.includes('não constitui comprovação') || !/\bcomprova\b/.test(body));
      return;
    }
    assert.equal(body.includes(word), false, `forbidden phrase present: ${word}`);
  });

  // 11. Page numbers sequential
  macro.pages.forEach((page, index) => {
    assert.equal(page.pageNumber, index + 1);
  });

  // 12. Figures present on macro
  const figures = macro.pages.flatMap((page) => page.sections.map((section) => section.figure).filter(Boolean));
  assert.ok(figures.some((figure) => figure?.kind === 'overview'));
  assert.ok(figures.some((figure) => figure?.kind === 'resources-map'));
  assert.ok(figures.some((figure) => figure?.kind === 'convergence-map'));

  console.log('theory-narrative.test.ts: all assertions passed');
}

run();
