# TDM Sass Module Standard

## Regra obrigatória

Todo estilo de componente do TDM deve usar **Sass Module com extensão `.module.sass`** e sintaxe indentada compatível com Dart Sass.

É proibido criar ou migrar estilos para:

- `.scss`
- `.module.scss`
- CSS global para resolver escopo local
- blocos de background multilinha incompatíveis com a sintaxe `.sass`

## Aplicação

Esta regra vale para:

- ChatGPT e copilotos que gerem patches
- Cursor e demais IDEs
- scripts de automação
- commits locais
- CI

## Exceções

Uma exceção exige decisão arquitetural explícita, documentação e atualização do gate. Sem isso, o gate deve falhar.

## Gate

Execute:

```bash
npm run check:tdm:sass-module-policy
```

O gate bloqueia arquivos `.scss` e `.module.scss` dentro de `src/` e exige que estilos de componente permaneçam em `.module.sass`.
