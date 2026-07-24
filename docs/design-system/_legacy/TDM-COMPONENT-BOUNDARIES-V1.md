# TDM Component Boundaries V1

## Objetivo

Impedir o nascimento de novos God Components sem tocar nas áreas protegidas do canvas, da timeline guiada ou da geometria interna dos previews.

## Regra automática

- Arquivos `.tsx`: até 400 linhas.
- Arquivos `.ts`: até 600 linhas.
- Dívida anterior fica registrada no baseline e não pode crescer.
- Arquivo novo acima do limite reprova o gate.
- Arquivo legado que ultrapassar o próprio baseline reprova o gate.

Comando:

```bash
npm run check:tdm:v2:boundaries
```

O gate também faz parte de `check:tdm:v2:all`.

## Refatoração piloto

`ResultTheoryTranslatorPane` teve estado, efeitos de interface, foco, scroll e exportação extraídos para `useResultTheoryTranslatorPane`.

A estrutura visual, os seletores CSS, as animações e a API pública foram preservados.

## Próximas ondas

Os maiores arquivos continuam visíveis no baseline. Eles devem ser reduzidos por feature, sem refatorações cosméticas e sem atravessar as zonas protegidas.
