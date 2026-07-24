# TDM Token Contract V2

## Camadas

### Referência

Valores concretos:

- `--tdm-neutral-*`;
- `--tdm-space-*`;
- `--tdm-radius-*`;
- `--tdm-font-*`;
- `--tdm-duration-*`;
- `--tdm-ease-*`.

### Sistema

Papéis do produto:

- `--tdm-surface-*`;
- `--tdm-fg-*`;
- `--tdm-border-*`;
- `--tdm-focus-*`;
- `--tdm-stage-*`;
- `--tdm-danger-*`.

### Componente

Contratos locais:

- `--tdm-button-*`;
- `--tdm-icon-button-*`;
- `--tdm-menu-*`;
- `--tdm-tooltip-*`;
- `--tdm-status-*`;
- `--tdm-card-*`;
- `--tdm-field-*`;
- `--tdm-header-*`;
- `--tdm-preview-*`.

## Naming

O nome descreve papel, não aparência nem origem.

Bom:

```text
--tdm-menu-background
--tdm-content-secondary
--tdm-stage-output-border
```

Proibido:

```text
--resend-gray
--apple-glass
--material-blue
--pretty-card-shadow
```

## Cores de etapa

```text
--tdm-stage-input: #8B7CFF
--tdm-stage-activity: #49B3FF
--tdm-stage-output: #F2A65A
--tdm-stage-outcome: #37C893
```

A aplicação não escolhe manualmente tons alternativos por rota.

## Uso da cor

A cor de etapa pode destacar:

- dot;
- kicker;
- estado ativo;
- conexão selecionada;
- feedback contextual.

Ela não deve colorir ao mesmo tempo fundo, borda, glow, texto, CTA e campo.

## Hardcodes

Hardcode só é válido em arquivo de referência/token. Exportadores de documento podem manter cores próprias quando a mídia exigir e estiverem explicitamente excluídos do gate visual da interface.
