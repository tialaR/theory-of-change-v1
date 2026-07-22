# TDM Design System Contract and Header Fix v1

Pacote de contrato para consolidar o Design System da aplicação TDM sem alterar domínio, stores, React Flow ou comportamento funcional.

## Conteúdo

- contrato mestre do Design System;
- mapa conhecido do projeto;
- matriz de QA visual e funcional;
- contrato específico do header público;
- previews HTML homologados;
- regras versionadas para o Cursor;
- gate executável inicial;
- prompt de auditoria e correção cirúrgica do header.

## Aplicação

Na raiz do projeto:

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-ds-contract-and-header-fix-v1.zip -d .
```

Depois, leia o prompt:

```bash
cat PROMPT-CURSOR-AUDIT-CONTRACT-HEADER-V1.md
```

Execute o gate somente depois que o Cursor completar os caminhos canônicos reais em `scripts/tdm-ds-contract.config.mjs`:

```bash
node scripts/check-tdm-ds-contract.mjs
```

Não faça commit antes do QA humano por rota.
