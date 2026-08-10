# ADR-0002: Governança opinativa

## Status

Accepted

## Decisão

O SharkOps assume a governança arquitetural após sua instalação.

Ele não transfere ao usuário decisões cobertas por suas políticas.

Os hooks delegam autoridade ao SharkOps. Gates clientes são classificados
e executados de acordo com a política ativa.

Mudanças destrutivas exigem rollback.

Mordidas somente podem ser concluídas após apply, verify e rollback passarem.

Dívidas não bloqueantes permanecem visíveis em relatório permanente.

## Consequência

O SharkOps reduz carga cognitiva e toma decisões repetitivas para que o usuário
possa se concentrar em produto e entrega.
