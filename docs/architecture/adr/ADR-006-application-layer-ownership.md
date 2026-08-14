# ADR-006: Application Layer Ownership

## Status
Accepted after SO-010 Application Slayer.

## Decision
Application owns framework-neutral use-case decisions and orchestration policies. UI, server actions, React Flow adapters and infrastructure remain effects adapters.

Application owns:
- node command decisions and editable-field contracts;
- relation save, removal and deletion decisions;
- assembly of persistible Canvas content from neutral graph data;
- save-state and bounded retry policies;
- authentication validation and result codes.

Application must not import React, Next.js, React Flow, UI, server or infrastructure modules.

## Consequences
Translated messages, browser events, routing, cookies, redirects and renderer-specific mutations remain outside Application. New cross-layer behavior must first receive a framework-neutral Application contract and executable gate.
