# React Bits Arsenal — Teoria da Mudança

## Objetivo do documento

Registrar componentes visuais e backgrounds candidatos do [React Bits](https://reactbits.dev) para acelerar a evolução do design system **Apple HIG Noir Glass** da aplicação, sem perder controle sobre onde, quando e por que cada recurso deve ser usado.

**Norte visual permanente:** Apple HIG · Noir Glass · dark mode vivo · paleta graphite / smoke / mineral · sem neon excessivo · sem carnaval de cores · sem cara de demo · sem fundo animado brigando com conteúdo · sem infantilizar.

---

## Convenções de status

| Status | Significado |
|--------|-------------|
| **guardado** | Componente local a criar ou já criado para uso futuro |
| **candidato** | Interessante, mas ainda não decidido |
| **aprovado** | Pode entrar em implementação |
| **experimental** | Usar com cuidado, somente em áreas pontuais |
| **rejeitado** | Não usar |

---

## Tabela-resumo

| Nome | Tipo | Uso sugerido | Status | Observações rápidas |
|------|------|--------------|--------|---------------------|
| GlassSurface | Componente / superfície glass | Base de liquid glass para cards, colunas, painéis e superfícies premium | aprovado | Peça principal para sair do “cinza borrado” e entrar em glass real |
| Grainient | Background | Base do fundo do Resultado e possivelmente de outras telas premium | aprovado | Melhor candidato para fundo contínuo Apple Noir vivo, com textura e profundidade |
| Orb | Background / assinatura visual | Símbolo vivo da Teoria da Mudança, hero, sidebar, estado final | aprovado prioritário | Peça oficial de identidade, usar com contenção e paleta noir |
| Evil Eye | Background animado | Assinatura visual localizada no hero / título / foco premium | experimental aprovado | Usar como detalhe editorial, não como fundo da tela inteira |
| Plasma | Background animado | camada animada sutil sob vidro / hero / bloco premium | experimental aprovado | usar como energia de fundo leve, não como base estrutural principal |
| Balatro | Background / textura animada | camada noir/dither sutil por trás de glass | experimental aprovado | usar como textura secundária, não como fundo principal sozinho |
| Folder | Componente / animação | Animação premium de pasta/documentos/drag visual | guardado | Não implementar ainda; guardar para uso futuro |
| Dock | Componente / navegação | Atalhos premium, command dock, menu flutuante, ações rápidas | guardado | Peça de arsenal; não entra agora |
| Glass Icons | Componente / ícones | Ícones premium para ações, export, risco, hipótese, documentos | guardado | Útil para polimento, não para estruturar layout |
| Stepper | Componente / fluxo guiado | Onboarding, wizard, progressão do canvas, revisão final | guardado | Bom para fluxo guiado; não prioritário na tela atual |
| Ferrofluid | Background animado | Efeito especial localizado, hero, área de destaque, superfície isolada | experimental | Bonito, mas forte demais para base do produto; usar só de forma localizada |

---

## GlassSurface

- **Tipo:** Componente / superfície glass
- **Link:** https://reactbits.dev/components/glass-surface?saturation=1.2&opacity=0.17&distortionScale=-80&borderRadius=11&borderWidth=0.15&blur=13&redOffset=-13&backgroundOpacity=0.27&brightness=71&displace=2.4&greenOffset=9
- **Uso no projeto:** Base de liquid glass para cards, colunas, painéis e superfícies premium.
- **Melhor lugar para usar:** Cards do Resultado, painéis laterais, superfícies flutuantes, colunas de conteúdo com hierarquia clara.
- **Evitar usar em:** Áreas de leitura densa sem contraste suficiente; superfícies que competem com o fundo Grainient sem necessidade.
- **Status:** aprovado
- **Observações visuais:** É uma das peças principais para sair do “cinza borrado” e entrar em glass real. Deve respeitar o tom Noir Glass — graphite, smoke, mineral — sem brilho excessivo ou aparência de demo.
- **Observações técnicas:** Parâmetros de referência já calibrados no link (saturation, opacity, blur, displace). Ao implementar, encapsular como componente local (`TdmGlassSurface` ou equivalente) para centralizar tokens e evitar cópia dispersa de props.
- **Próximo passo:** Manter como superfície glass preferida; usar como base em novas superfícies premium.

---

## Grainient

- **Tipo:** Background
- **Link:** https://reactbits.dev/backgrounds/grainient?color1=141214&color2=c3bed4&color3=454249
- **Uso no projeto:** Base do fundo do Resultado e possivelmente de outras telas premium.
- **Melhor lugar para usar:** Tela Resultado, telas de apresentação final, áreas que precisam de fundo contínuo com profundidade e textura sutil.
- **Evitar usar em:** Canvas de edição (compete com nós e conexões); áreas que exigem fundo neutro e estático para foco cognitivo.
- **Status:** aprovado
- **Observações visuais:** Melhor candidato para fundo contínuo Apple Noir vivo, com textura e profundidade. Paleta alinhada ao graphite/smoke/mineral; evitar saturação que lembre neon ou carnaval de cores.
- **Observações técnicas:** Background de tela cheia; garantir performance em dispositivos modestos. Considerar fallback estático para `prefers-reduced-motion`.
- **Próximo passo:** Manter como fundo base preferido no momento.

---

## Orb

- **Tipo:** Background / assinatura visual
- **Link:** https://reactbits.dev/backgrounds/orb?hoverIntensity=1.59&rotateOnHover=false
- **Uso no projeto:** representar a Teoria da Mudança como objeto vivo, orgânico e premium.
- **Melhor lugar para usar:** hero da tela Resultado, sidebar, loading premium, estado final, empty state refinado.
- **Evitar usar em:** fundo inteiro da tela, cards de leitura densa, canvas interativo e áreas onde pode competir com conexões.
- **Status:** aprovado prioritário
- **Observações visuais:** este é o principal candidato para virar assinatura visual da aplicação. Deve seguir Apple HIG Noir Glass, dark mode vivo, graphite, smoke e prata mineral.
- **Observações técnicas:** copiar/adaptar somente se for leve e local. Não instalar React Bits inteiro. Não usar Tailwind. Não aceitar WebGL, Three, OGL, GSAP ou dependência pesada sem aprovação.
- **Parâmetros aprovados:** hoverIntensity=1.59, rotateOnHover=false
- **Próximo passo:** testar como elemento localizado no hero ou sidebar, sem substituir Grainient como fundo base.

---

## Evil Eye

- **Tipo:** Background animado
- **Link:** https://reactbits.dev/backgrounds/evil-eye?intensity=0.7&glowIntensity=0.1&pupilFollow=0.5&noiseScale=3&irisWidth=0.7&flameSpeed=0.6&scale=0.4&pupilSize=0.4&eyeColor=94a3b8&backgroundColor=000000
- **Uso no projeto:** assinatura visual premium para hero, título, área de foco ou estado final da teoria.
- **Melhor lugar para usar:** hero da tela Resultado, atrás do título "Nova teoria da mudança", com opacidade baixa e máscara radial.
- **Evitar usar em:** fundo inteiro da aplicação, cards, colunas, canvas e áreas de leitura densa.
- **Status:** experimental aprovado
- **Observações visuais:** tem uma estética forte, quase oracular. Usar como detalhe de presença, não como decoração dominante.
- **Observações técnicas:** só copiar/adaptar se a versão for leve e não exigir WebGL, Three, OGL, GSAP ou dependência pesada.
- **Próximo passo:** testar como camada localizada no hero da tela Resultado, atrás da tipografia, combinado com Grainient e GlassSurface.

---

## Plasma

- **Tipo:** Background animado
- **Link:** https://reactbits.dev/backgrounds/plasma?scale=0.5&color=717579&opacity=0.2&speed=0.8
- **Uso no projeto:** adicionar movimento e profundidade sutil em áreas premium da interface.
- **Melhor lugar para usar:** por trás de GlassSurface, em hero, coluna de destaque, callout premium, header com presença visual.
- **Evitar usar em:** fundo inteiro da aplicação, canvas inteiro, áreas com leitura muito densa ou composição já carregada.
- **Status:** experimental aprovado
- **Observações visuais:** passa sensação de energia viva e atmosfera líquida, mas deve ficar bem suave para não virar efeito chamativo demais. Respeitar Apple HIG Noir Glass — graphite, smoke, mineral — sem neon excessivo, sem carnaval e sem cara de demo.
- **Observações técnicas:** preferir uso localizado e com baixa opacidade. Integrar com palette graphite/smoke/mineral da aplicação. Não deixar o fundo animado competir com leitura ou com superfícies glass.
- **Próximo passo:** manter disponível como camada secundária por trás do liquid glass, sem substituir Grainient como fundo base.

---

## Balatro

- **Tipo:** Background / textura animada
- **Link:** https://reactbits.dev/backgrounds/balatro?color1=000000&color3=242323&color2=7d7e80&pixelFilter=1270
- **Uso no projeto:** criar textura visual graphite/noir com sensação de dither, profundidade e movimento controlado.
- **Melhor lugar para usar:** por trás de GlassSurface, em hero, fundo de seções premium ou camada secundária acima do Grainient.
- **Evitar usar em:** Canvas inteiro, cards de leitura densa, fundo principal isolado ou áreas onde a textura atrapalhe leitura.
- **Status:** experimental aprovado
- **Observações visuais:** combina com a aplicação se ficar muito sutil. Deve parecer textura noir premium, não efeito gamer.
- **Observações técnicas:** copiar/adaptar somente se for leve. Não instalar React Bits inteiro. Não usar Tailwind. Não aceitar WebGL, Three, OGL, GSAP ou dependência pesada sem aprovação.
- **Parâmetros aprovados:** color1=000000, color2=7d7e80, color3=242323, pixelFilter=1270
- **Próximo passo:** testar como camada sutil atrás do GlassSurface na tela Resultado, sem substituir o Grainient.

---

## Folder

- **Tipo:** Componente / animação
- **Link:** https://reactbits.dev/components/folder?color=414040
- **Uso no projeto:** Recuperar futuramente a animação premium de pasta/documentos/drag visual.
- **Melhor lugar para usar:** Estados de upload, organização de documentos, drag-and-drop visual, empty states com narrativa de “pasta de trabalho”.
- **Evitar usar em:** Fluxos críticos onde a animação distrai; telas já carregadas de informação.
- **Status:** guardado
- **Observações visuais:** Tom escuro (`#414040`) compatível com Noir Glass. Usar com moderação — polimento, não protagonismo.
- **Observações técnicas:** Não implementar ainda. Guardar referência e parâmetros para quando houver demanda de UX de documentos/pastas.
- **Próximo passo:** Manter registrado; não implementar agora.

---

## Dock

- **Tipo:** Componente / navegação
- **Link:** https://reactbits.dev/components/dock?panelHeight=110&baseItemSize=60&magnification=60
- **Uso no projeto:** Atalhos premium, command dock, menu flutuante, possíveis ações rápidas.
- **Melhor lugar para usar:** Barra de ações flutuante, atalhos contextuais, command palette visual.
- **Evitar usar em:** Navegação principal da aplicação; substituir sidebar ou estrutura já estabelecida sem decisão de produto.
- **Status:** guardado
- **Observações visuais:** Estética macOS-like; alinha com Apple HIG se usado com ícones discretos e sem excesso de magnificação.
- **Observações técnicas:** Peça de arsenal; não entra agora. Avaliar acessibilidade (teclado, foco) antes de qualquer implementação.
- **Próximo passo:** Manter registrado; não implementar agora.

---

## Glass Icons

- **Tipo:** Componente / ícones
- **Link:** https://reactbits.dev/components/glass-icons
- **Uso no projeto:** Ícones premium para ações, export, risco, hipótese, documentos.
- **Melhor lugar para usar:** Botões de ação secundária, chips de categoria, ícones de exportação e metadados no Resultado.
- **Evitar usar em:** Ícones funcionais de navegação primária; listas longas onde o glass repetido polui visualmente.
- **Status:** guardado
- **Observações visuais:** Útil para polimento, não para estruturar layout. Manter coerência com GlassSurface — mesmo vocabulário de blur e opacidade.
- **Observações técnicas:** Complementar, não substituir ícones do sistema. Avaliar bundle size se cada ícone for um componente pesado.
- **Próximo passo:** Manter registrado; usar apenas quando houver rodada de polimento visual.

---

## Stepper

- **Tipo:** Componente / fluxo guiado
- **Link:** https://reactbits.dev/components/stepper?step=3
- **Uso no projeto:** Onboarding, wizard, progressão do canvas, revisão final.
- **Melhor lugar para usar:** Fluxos multi-etapa novos, onboarding de primeiro uso, wizard de exportação ou revisão.
- **Evitar usar em:** Tela atual do canvas (não prioritário); áreas onde o usuário já domina o fluxo.
- **Status:** guardado
- **Observações visuais:** Bom para fluxo guiado com hierarquia clara. Estilo deve seguir Noir Glass — passos discretos, sem cores de “progresso genérico” saturadas.
- **Observações técnicas:** Integrar com estado de rota ou store de progresso; não acoplar ao canvas existente sem spec de produto.
- **Próximo passo:** Manter registrado; não implementar agora.

---

## Ferrofluid

- **Tipo:** Background animado
- **Link:** https://reactbits.dev/backgrounds/ferrofluid?color1=6e6969&color3=94a3b8&scale=1.8&rimWidth=0.21&glow=1.9&turbulence=0.2&sharpness=2.3&mouseStrength=0.4&speed=0.2&fluidity=0.09&shimmer=1.55&mouseRadius=0.3
- **Uso no projeto:** Efeito especial localizado, hero, área de destaque, superfície isolada.
- **Melhor lugar para usar:** Atrás de título, hero, bloco premium isolado, textura viva por baixo de glass.
- **Evitar usar em:** Background principal do Canvas e da tela Resultado inteira.
- **Status:** experimental
- **Observações visuais:** Bonito, mas forte demais para a base do produto. Tende a roubar atenção e competir com leitura e com as conexões. Não é fundo principal recomendado — apenas efeito pontual.
- **Observações técnicas:** Usar apenas de forma localizada, com paleta mais graphite/smoke e sem exagero de glow/azul. Monitorar GPU e interação com mouse; desabilitar ou simplificar com `prefers-reduced-motion`.
- **Próximo passo:** Manter registrado, mas não implementar agora.

---

## Próximos candidatos

Espaço reservado para novos componentes e backgrounds avaliados no React Bits ou em outras fontes, sempre filtrados pelo norte **Apple HIG Noir Glass**.

| Nome | Tipo | Nota inicial | Status |
|------|------|--------------|--------|
| — | — | Adicionar aqui conforme novas avaliações | candidato |

**Critérios para incluir um novo candidato:**
- Alinha com dark mode vivo, graphite/smoke/mineral?
- Serve um problema real da aplicação (não só “ficou bonito”)?
- Não infantiliza nem parece demo?
- Tem lugar claro no produto — e lugares onde **não** deve ser usado?

---

## Decisão atual

- **Fundo base preferido:** Grainient
- **Textura noir secundária:** Balatro
- **Superfície glass preferida:** GlassSurface
- **Assinatura visual principal:** Orb
- **Assinatura visual alternativa guardada:** Evil Eye
- **Camada animada secundária guardada:** Plasma
- **Efeito especial reservado:** Ferrofluid
- **Componentes guardados:** Folder, Dock, Glass Icons, Stepper

**Reforço de norte:** Apple HIG · Noir Glass · dark mode vivo · graphite / smoke / mineral · sem neon excessivo · sem carnaval · sem cara de demo · sem fundo animado brigando com conteúdo.

**Reforço Orb:** Orb é **aprovado prioritário** — peça oficial de identidade visual da Teoria da Mudança. Grainient continua sendo o fundo base; Orb não deve virar background inteiro da página. Usar Orb como presença visual controlada e localizada (hero, sidebar, loading, estado final). Nada de demo visual · nada de neon/carnaval · nada de escuridão funeral.
