# Header GlassSurface v7

Patch criado para substituir as tentativas antigas de liquid glass do header por um componente compartilhado e escopado.

## O que foi feito

- Cria `src/shared/ui/glass-surface` com React + `.module.sass`.
- Usa `GlassSurface` como camada visual do header publico.
- Ativa o vidro somente quando `data-scrolled='true'`.
- Header fica sem borda, sem radius e sem assets PNG antigos.
- Remove/restaura visualmente os pseudo-elementos antigos do header com override local.
- Nao toca em `/canvas`.

## Props usadas no header

`borderRadius={0}`, `borderWidth={0}`, `brightness={51}`, `opacity={0.93}`, `blur={30}`, `displace={5}`, `backgroundOpacity={0.26}`, `saturation={0.7}`, `distortionScale={140}`, `redOffset={0}`, `greenOffset={0}`, `blueOffset={0}`, `mixBlendMode='screen'`.

## Depois do canvas

Revisar arquitetura feature-based: separar `home`, `examples`, `guide`, `result-experience`, `flow-vision`, `canvas` e `theory-of-change-core`.
