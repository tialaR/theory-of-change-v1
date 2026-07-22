# Decision Log: Guided Story + Header Skin v1

## Data

2026-07-22

## Decisões aprovadas

### Guided Story

- A experiência `tdm-guided-story-v7-validated.html` está visualmente validada.
- A primeira etapa chama-se `Prévia`.
- O header dos capítulos mostra apenas dot + texto, sem 00 a 06.
- O footer da Prévia usa o texto homologado no contrato.
- O ícone do footer narrativo foi reduzido levemente e não deve voltar ao tamanho anterior.
- A experiência completa, incluindo as sete etapas, deve ser integrada na Home.
- O HTML de referência não deve ser embutido diretamente.

### Header público

- O comportamento atual de visibilidade por scroll está aprovado e congelado (`data-scrolled` + IntersectionObserver existentes).
- No topo, a carcaça permanece transparente (não percebida); após scroll, recebe somente a superfície V3.
- V3 é decisão posterior e específica da roupa scrolled; não apaga o histórico V2.
- Espaçamentos e componentes internos permanecem integralmente preservados.
- Assets da Guided Story: logo/mark exportados da referência HTML (`tmd-construtor-guided-story-logo.png`, `tmd-construtor-guided-story-mark.png`); hashes distintos de `tdm-brand-icon.png`.

## Fora de escopo

- alterações no Canvas;
- alterações no domínio;
- alterações em stores;
- alterações em React Flow;
- redesign do hero;
- redesign do footer global;
- troca da logo;
- criação de novo Design System;
- mudanças em conteúdo não descritas neste contrato.
