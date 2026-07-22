# TDM Public Visual Cleanup V5

Status: CANÔNICO após homologação humana.

## Escopo

Ajuste exclusivamente visual da experiência pública:

1. remoção definitiva do copyright/footer legado;
2. permanência exclusiva do copyright aprovado;
3. remoção do parágrafo redundante antes da Guided Story na Home;
4. redução da escala tipográfica do header interno da Guided Story somente na Home;
5. equivalência de tamanho entre o losango do footer da Guided Story e o losango do header público.

## Copyright canônico

```text
© ANO_ATUAL TMD Construtor. Todos os direitos reservados.
Ferramenta visual para construir, revisar e comunicar teorias da mudança.
```

O ano é dinâmico. Não existem, neste estágio, Termos, Privacidade, Cookies, CNPJ, razão social, redes sociais ou crédito de desenvolvimento a exibir.

## Regra de remoção do legado

Textos, wrappers, pseudo-elementos e divisores anteriores devem ser excluídos do consumidor ativo. Não usar `display: none`, opacidade, clipping ou sobreposição para ocultar o legado.

## Intro da Guided Story

Na Home, manter:

- label `PRÉVIA GUIADA`;
- título `Veja a teoria ganhar forma.`;
- espaço editorial até a experiência.

Remover somente o parágrafo de apoio que começa com `Primeiro, os elementos entram em sequência...`, porque o próprio componente já apresenta contexto por capítulo, título e descrição.

## Tipografia interna

A hierarquia deve ser:

1. título da seção da página;
2. título do capítulo dentro da Guided Story;
3. descrição do capítulo.

O título interno deve ser visualmente um passo menor que o título externo, sem alterar peso, família, conteúdo ou layout dos controles.

## Marca

O losango no footer interno da Guided Story deve usar o mesmo tamanho visual do losango no header público. Preferir um token semântico compartilhado, sem trocar asset e sem reconstruir a marca.

## Área proibida

Nenhuma alteração em:

- timers e durações;
- `requestAnimationFrame`;
- cálculo de capítulos;
- estados de play/pause/replay;
- paths, edges e coordenadas;
- handlers;
- observer do header;
- Canvas, React Flow, stores ou domínio.
