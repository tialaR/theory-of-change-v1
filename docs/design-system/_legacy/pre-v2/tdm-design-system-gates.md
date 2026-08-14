# TDM Design System Gates

## Objetivo

Impedir que a dívida visual volte ao repositório após a consolidação do Design System canônico TDM (`--tdm-*`, primitivos `tdm-*`, motion canônico).

O gate é **protetivo**: não redesenha telas e não altera comportamento. Ele falha quando surgem novas violações fora da baseline autorizada.

## Comandos

```bash
# Gate do Design System (rápido)
npm run check:tdm-ds

# Gate completo do projeto
npm run check:tdm
```

Equivalente direto:

```bash
node scripts/check-tdm-design-system.mjs
```

Self-test interno (fixtures temporárias, sem deixar arquivos):

```bash
node scripts/check-tdm-design-system.mjs --self-test
```

## Escopo

Inspeciona:

- `src/app/**`
- `src/shared/styles/tdm/**`
- `src/shared/ui/**` (inclui `tdm-*` e detecta paralelos)
- `src/shared/motion/tdm-motion/**`
- `src/features/theory-of-change/components/**`

Exclui: `node_modules`, `.next`, `dist`, `build`, `coverage`, `public`, `generated`, fixtures/snapshots, binários e artefatos de exportação (`**/export/**`).

## Regras (IDs estáveis)

| ID | Detecta | Correção típica |
| --- | --- | --- |
| `TDM-DS-001` | `!important` | Remover; preferir especificidade + tokens |
| `TDM-DS-002` | `transition: all` | Propriedades explícitas + `--tdm-motion-*` |
| `TDM-DS-003` | hex / `rgb(a)` / `hsl(a)` | `var(--tdm-*)` |
| `TDM-DS-004` | `font-size` em `px` | escala `rem` canônica |
| `TDM-DS-005` | `font-size` com `vw` inválido | `clamp(rem, vw, rem)` ou `rem` |
| `TDM-DS-006` | texto `< 0.75rem` | mínimo tipográfico TDM |
| `TDM-DS-007` | `font-weight` > 600 | 400–600 |
| `TDM-DS-008` | novos `.scss` | usar `.sass` / `.module.sass` |
| `TDM-DS-009` | imports de DS legado | `tdm-*` ou `tdm-public-design-system` |
| `TDM-DS-010` | primitivos paralelos em `shared/ui` | reutilizar pacotes canônicos |
| `TDM-DS-011` | loops decorativos infinitos | só loading/spinner/logo autorizados |
| `TDM-DS-012` | tokens locais paralelos | alias `var(--tdm-*)` ou token canônico |
| `TDM-DS-013` | canônicos ignorados pelo Git | ajustar `.gitignore` |
| `TDM-DS-014` | import entre features irmãs | extrair para `shared` |
| `TDM-DS-015` | inline style visual estático | classes/tokens; coords dinâmicas ok |

## Exemplo de erro

```text
[TDM-DS-002] src/shared/ui/tdm-button/tdm-button.module.sass:42
transition: all não é permitida.
Use propriedades explícitas e tokens --tdm-motion-*.
```

## Baseline

Arquivo: `scripts/tdm-design-system-baseline.json`

Cada entrada traz `rule`, `path`, `reason`, `removeIn` e, quando a linha é instável, `allowCount` (orçamento por arquivo).

Revisão Fase 5A (V1 RC): entradas restantes apontam remoção para **Fase 5B**. O gate avisa entradas obsoletas ou orçamentos apertáveis; novas violações falham o CI.

Regras da baseline:

- nenhuma entrada sem motivo;
- sem wildcards e sem liberar pasta inteira;
- **não cresce automaticamente** — novas violações falham o gate;
- se `allowCount` usado < permitido, o gate avisa para apertar;
- se uma entrada deixar de ser necessária, o gate avisa para remover.

### Como adicionar exceção justificada

1. Confirme que a violação é pré-existente ou inevitável (não um regresso novo).
2. Adicione **uma** entrada explícita em `scripts/tdm-design-system-baseline.json`.
3. Preencha `reason` e `removeIn` (fase futura de remoção).
4. Prefira `allowCount` mínimo; evite omitir orçamento.
5. Rode `npm run check:tdm-ds` e garanta exit `0`.

A baseline **não deve crescer** como hábito: cada entrada é dívida documentada.

## Integração

- Não há workflow CI versionado neste repositório.
- Use localmente: `npm run check:tdm-ds` antes do build, ou `npm run check:tdm`.
- ESLint permanece com `eslint.config.mjs` (Next core-web-vitals); o gate DS é complementar via Node.

## Por que isso existe

As fases 1–4A consolidaram tokens e primitivos. Sem gate, hardcodes, `!important`, loops decorativos e DS paralelos voltam silenciosamente. Este script congela a dívida conhecida e bloqueia regressões novas.
