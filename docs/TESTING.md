# Testes — o que cada prova realmente significa

## Filosofia

Teste verde só importa quando sabemos **o que ele prova**.

## E2E

Os E2Es de release rodam isoladamente: cada arquivo recebe um processo Playwright e servidor novo.

Isso foi adotado porque a auditoria Post-Golden encontrou sensibilidade à ordem quando vários arquivos compartilhavam o mesmo servidor.

### Cobertura comportamental atual

- autenticação mock;
- proteção do Canvas;
- disponibilidade das rotas públicas;
- Canvas oficial com React Flow;
- preservação de projetos;
- autosave;
- criação de blocos sem substituir IDs hidratados;
- distinção entre 404 e outros estados.

## O que os testes não afirmam

Eles não significam cobertura total de todas as combinações possíveis.
Eles provam os contratos críticos escolhidos para a V1.

## Comandos

```bash
npm run lint
npm run typecheck
npm run test:e2e
npm run build
npm run shark:verify
```
