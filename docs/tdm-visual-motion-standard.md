# Padrão visual e de movimento TDM TMD

**Status**

- documento canônico;
- obrigatório para trabalho visual futuro;
- aplicável às rotas públicas, exemplos e componentes migrados;
- não representa um design system oficial do TMD;
- representa uma interpretação interna baseada nas referências observadas,
  adaptada à identidade da aplicação TDM.

Não copiar marca, conteúdo, logos, textos ou assets do TMD.
A identidade cromática semântica da TDM (cores por etapa) permanece própria.

---

## Fonte canônica

Este arquivo é a fonte canônica de identidade visual e movimento para UI de produto TDM.

- TMD é a principal referência de disciplina visual para UI de produto.
- Lusion pode continuar como referência ambiental limitada a heros e
  composições editoriais específicas.
- Lusion não governa movimento de componentes.
- Movimento de produto segue este padrão TDM TMD.
- Cores da TDM permanecem como identidade semântica própria.

---

## 6.1 Conteúdo antes do efeito

- o conteúdo é o protagonista;
- animação, sombra, cor e vidro são subordinados;
- nenhum efeito pode dificultar leitura;
- nenhuma superfície pode existir apenas para exibir tecnologia visual.

## 6.2 Uma ação visual por vez

- cada momento deve possuir um foco principal;
- não animar vários elementos concorrentes;
- não combinar pulsação, movimento, glow e mudança de cor simultaneamente;
- a interface deve estabilizar depois de comunicar o estado.

## 6.3 Base neutra

- preto, grafite, cinza, prata e branco formam a base;
- cores de etapas são semânticas;
- cores aparecem em dots, pequenos acentos, estados e indicadores;
- cores não devem inundar fundos, sombras ou conexões.

## 6.4 Hierarquia silenciosa

- hierarquia por tamanho, peso, contraste e espaço;
- não por glow, saturação ou escala exagerada;
- títulos não precisam ser pesados para serem relevantes;
- elementos auxiliares devem permanecer visualmente auxiliares.

## 6.5 Superfícies estáveis

- fundos e cards não ficam pulsando;
- superfícies devem parecer sólidas e legíveis;
- transparência deve ser baixa e controlada;
- Liquid Glass fica restrito a navegação e controles quando fizer sentido;
- conteúdo principal não pode parecer flutuando em gel.

## 6.6 Espaço negativo funcional

- respiro organiza grupos;
- espaço vazio não pode ser ornamental ou desperdiçado;
- proximidade indica relação;
- separação indica mudança de assunto ou função.

## 6.7 Consistência

- o usuário não pode encontrar animação clássica em uma tela e animação
  gamer na tela seguinte;
- todo componente deve parecer pertencente à mesma aplicação;
- variações devem preservar os mesmos tokens e a mesma gramática.

---

## 7.1 Movimento possui propósito

Permitido apenas para:

- apresentar hierarquia;
- revelar sequência;
- mostrar origem e destino;
- indicar mudança de estado;
- confirmar interação;
- conduzir atenção;
- preservar continuidade espacial.

Proibido usar movimento somente para decorar.

## 7.2 Estado de repouso

Toda animação precisa terminar.

Após a animação:

- cards ficam estáticos;
- conexões ficam estáticas;
- opacidade estabiliza;
- não existe pulsação;
- não existe energia percorrendo caminhos;
- não existe loop decorativo.

## 7.3 Movimento clássico

A identidade TDM TMD utiliza:

- fade;
- pequena translação;
- desenho único de caminho;
- crossfade;
- shared highlight;
- mudança discreta de contraste;
- layout animation quando o layout realmente muda.

Evitar:

- bounce evidente;
- spring elástica;
- overshoot chamativo;
- zoom dramático;
- rotação;
- parallax;
- shake;
- pulso contínuo;
- escala grande;
- aceleração linear infinita.

## 7.4 Amplitude

- deslocamento comum entre 0.125rem e 0.375rem;
- hover entre 0 e 0.125rem;
- não usar saltos de 0.5rem ou maiores em interfaces comuns;
- não usar scale acima de 1.015 em microinterações;
- preferir nenhum scale.

## 7.5 Duração

Tokens:

- microfeedback: 0.16s a 0.2s;
- mudança de estado: 0.24s a 0.32s;
- entrada de superfície: 0.32s a 0.42s;
- desenho de conexão: 0.46s a 0.58s;
- sequência completa: máximo aproximado de 3.6s.

## 7.6 Easing

Padrão:

`[0.22, 1, 0.36, 1]`

Proibir `linear` para transições de interface.

## 7.7 Loops

Loops infinitos são proibidos em:

- conexões;
- cards;
- backgrounds;
- destaques;
- setas;
- dots;
- títulos.

Exceções futuras precisam de justificativa funcional explícita, como
carregamento indeterminado.

## 7.8 Reduced Motion

- respeitar a preferência do usuário;
- com Reduced Motion, mostrar o estado final imediatamente;
- manter opacity quando necessária;
- remover deslocamentos;
- remover desenho progressivo de caminhos;
- não depender de animação para comunicar informação.

---

## 8.1 Hierarquia da página

Ordem visual:

1. contexto;
2. título;
3. descrição;
4. demonstração;
5. ação;
6. conteúdo secundário.

Não colocar múltiplos títulos disputando atenção.

## 8.2 Componentes

- borda fina;
- radius controlado;
- sombra curta;
- top light discreto;
- contraste tonal entre camadas;
- sem halo;
- sem borda cromática completa;
- sem card dentro de card sem necessidade.

## 8.3 Tipografia

- Inter para interface;
- corpo Regular;
- títulos Medium ou Semibold;
- evitar Bold excessivo;
- labels uppercase com tracking controlado;
- textos secundários com contraste reduzido, mas legível.

## 8.4 Cores

- neutralidade predominante;
- cores por etapa somente como significado;
- caminhos e setas neutros por padrão;
- caminho ativo pode usar branco/prata mais visível;
- não exibir quatro cores competindo simultaneamente em conexões.

## 8.5 Controles

- compactos;
- legíveis;
- sem gigantismo;
- sem formato de brinquedo;
- hover muda contraste antes de mudar posição;
- ícones e texto respondem juntos.

---

## Anti-padrões

Proibido:

- `repeat: Infinity` decorativo;
- `ease: linear` em UI;
- opacidade pulsante;
- caminhos em movimento contínuo;
- rainbow animation;
- todas as conexões animando juntas;
- glow colorido;
- blur cromático;
- bounce;
- scale chamativo;
- cards saltando;
- backgrounds animados;
- múltiplos focos simultâneos;
- movimento sem estado final;
- animação como única forma de comunicar estado;
- interface parecendo dashboard gamer;
- misturar gramáticas de movimento incompatíveis.

---

## Tokens de motion (prévias de exemplo)

Referência local em `example-preview-motion.ts`:

| Token | Valor |
|-------|-------|
| ease | `[0.22, 1, 0.36, 1]` |
| surface.duration | `0.34` |
| card.duration | `0.36` |
| card.offsetY | `4` |
| connection.duration | `0.52` |
| connection.baseOpacity | `0.22` |
| connection.revealOpacity | `0.7` |
| stageStagger | `0.08` |
| connectionStagger | `0.07` |
| groupDelay | `0.38` |

---

## Padrão de conexão

1. caminho base estático;
2. overlay de revelação executado uma vez;
3. overlay desaparece;
4. caminho base permanece estático.

Conexões usam base neutra:

- caminho base: `rgba(235, 237, 240, 0.2–0.28)`
- overlay temporário: `rgba(248, 249, 250, 0.68–0.78)`
- arrowhead: `rgba(238, 240, 243, 0.55–0.7)`

Cores por etapa permanecem somente em dots, acentos, badges e detalhes semânticos.

---

## Checklist rápido

Antes de entregar trabalho visual ou de motion:

- [ ] conteúdo legível sem depender de animação;
- [ ] uma ação visual por vez;
- [ ] animação termina em estado de repouso;
- [ ] sem `repeat: Infinity` decorativo;
- [ ] sem `ease: linear` em UI;
- [ ] sem pulsação, glow cromático ou rainbow;
- [ ] conexões neutras; cores só em semântica de etapa;
- [ ] amplitude e duração dentro dos tokens;
- [ ] `useReducedMotion` / estado final imediato;
- [ ] gramática consistente com o restante do produto.
