# Header GlassSurface v8

Patch final para o header liquid glass sem bordas visiveis.

## O que corrige

- Remove bordas reais e bordas aparentes do header.
- Desativa pseudo-elementos antigos do header via override escopado.
- Usa GlassSurface compartilhado com borderRadius zero e borderWidth zero.
- Remove box-shadows da superficie quando borderWidth e menor ou igual a zero.
- Aplica overscan lateral de 2rem para tirar cortes nas laterais do viewport.
- Aplica mascara vertical para suavizar a linha inferior do header.
- Mantem o vidro apenas no scroll.
- Nao toca em /canvas.

## Props usadas no header

- backgroundOpacity 0.26
- saturation 0.7
- brightness 51
- opacity 0.93
- blur 30
- displace 5
- distortionScale 140
- redOffset 0
- greenOffset 0
- blueOffset 0
- mixBlendMode screen

## Nota

Este patch ainda deixa a arquitetura maior para depois do canvas: separar as features publicas em home, examples, guide, result-experience, flow-vision, canvas e theory-of-change-core.
