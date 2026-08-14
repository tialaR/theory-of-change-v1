# SO-015 Wave 04 — Public Visual Language & Design System Foundations

## Decision

The Canvas is not the sole visual source of truth for TDM. Public routes already express a distinct and coherent visual language through their own shell, header behavior, typography, spacing, surfaces, SVG/motion recipes and content composition.

The goal is not to make every route look the same. The goal is to formalize what is truly shared underneath the existing experience while preserving intentional personality.

## Promotion rule

Visual existing → formal language → evidence → token/primitive/component → SharkOps gate → future Storybook.

A visual value or component is promoted only when repeated semantic meaning or cross-route behavior proves that it belongs to the Design System. Visual similarity alone is not enough. One-off art direction remains feature-owned.

## Existing foundation confirmed

- `src/shared/styles/tdm/tdm-tokens.sass` already aggregates canonical `--tdm-*` tokens.
- `src/shared/ui/tdm-public-layout` owns the public shell, header, navigation, content measure, reveal and timeline behavior.
- `src/shared/motion/tdm-motion` owns shared motion infrastructure.
- shared UI already includes button, icon button, surface, kicker, context label and public feature card primitives.
- public feature styles already consume many semantic tokens while retaining local recipes/literals for unique diagrams, onboarding and interactive examples.

## Explicit non-goals

This wave does not normalize literal values, move feature-specific art direction into shared UI, redesign public routes or copy Canvas primitives into public surfaces. Those changes require separate evidence-backed bites.

## Gate

`check:tdm:public-routes:wave04` protects the visual-language contract, Sass Module policy for component styles, independence of shared public foundations from Canvas/public-page implementation, and cumulative SO-015 / Golden State governance.
