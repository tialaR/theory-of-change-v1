# SO-015 Wave 05 — Shared Public Primitives & Composition Contracts

This wave formalizes a simple rule: visual uniqueness is not architectural permission for a God Component.

The public visual language remains an independent source of truth. Unique recipes stay feature-owned, while repeated semantics may be promoted to shared primitives only with evidence.

The first proven decomposition target is `TheoryFlowBoard`, which previously mixed relation traversal, SVG edge rendering, stage labels and interactive cards in one file. The behavior and styling remain unchanged; responsibilities now live in focused feature-local modules.

`GuidedStory` is not refactored in this wave because it is already decomposed across dedicated data, scheduler, hook, scenes and shared presentation modules.
