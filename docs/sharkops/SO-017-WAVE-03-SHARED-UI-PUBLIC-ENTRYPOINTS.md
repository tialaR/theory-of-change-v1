# SO-017 Wave 03 — Shared UI Public Entrypoints Contract

SHELL-002 is resolved without introducing a global shared-ui barrel. `tdm-field` and `tooltip` now own local public entrypoints, and all inventoried consumers import those entrypoints rather than implementation files. A gate prevents the two deep-import patterns from returning.
