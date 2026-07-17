import type {
  TheoryDocumentModel,
  TheoryNarrativeMode,
  TheoryNarrativeSelection
} from '../result-theory-narrative/theory-narrative.types';

export type {
  TheoryDocumentModel,
  TheoryNarrativeMode,
  TheoryNarrativeSelection
};

/** Selection driving Intérprete scoped mode. */
export type TheoryTranslatorSelection = Exclude<TheoryNarrativeSelection, null>;

/** @deprecated Prefer TheoryDocumentModel */
export type TheoryTranslatorViewModel = TheoryDocumentModel;
