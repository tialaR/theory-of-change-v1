# TDM Consolidation Hotfix V1.1

## Motivo

O gate `check:tdm:v2:changed-lint` enviava ao ESLint caminhos que faziam parte da diferença entre a branch e a base, mas que já haviam sido removidos no working tree. O ESLint 9 encerra com erro quando recebe um caminho inexistente.

## Correção

- reúne alterações commitadas, staged, unstaged e untracked;
- aceita somente arquivos JavaScript/TypeScript existentes no disco;
- ignora arquivos removidos antes de invocar o ESLint;
- evita download implícito de dependências usando `npx --no-install`;
- adiciona `--no-error-on-unmatched-pattern` como segunda camada de proteção;
- mantém o gate shrink-only e não mascara erros reais de lint.

## Escopo

Nenhum componente, estilo, rota ou comportamento da aplicação é alterado.
