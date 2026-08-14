# Contribuindo

## Comece pelo produto

Antes de editar código, entenda qual jornada ou regra está sendo alterada.

## Fluxo recomendado

1. atualize sua branch;
2. identifique a menor mudança possível;
3. preserve boundaries existentes;
4. implemente;
5. rode os gates relevantes;
6. documente decisões arquiteturais quando necessário.

## Regras importantes

- não usar `.scss` para estilos do produto;
- preservar Sass Modules `.module.sass`;
- evitar CSS global sem justificativa;
- não enfraquecer Golden States silenciosamente;
- dependência nova precisa justificar custo e manutenção;
- alterações de arquitetura precisam de evidência;
- testes devem provar comportamento, não apenas execução.

## Antes de abrir PR

```bash
npm run lint
npm run typecheck
npm run test:e2e
npm run build
npm run shark:verify
```
