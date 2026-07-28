# TDM Official References V1

Consultadas em julho de 2026.

## Next.js

- App Router Getting Started: https://nextjs.org/docs/app/getting-started
- Layouts and Pages: https://nextjs.org/docs/app/getting-started/layouts-and-pages
- Project Structure: https://nextjs.org/docs/app/getting-started/project-structure
- Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Error Handling: https://nextjs.org/docs/app/getting-started/error-handling

Decisões absorvidas:

- pages/layouts Server por padrão;
- route groups para organização sem mudar URL;
- `loading`, `error` e `not-found` como convenções de rota;
- app directory fino e organização consistente por feature.

## React 19

- Suspense: https://react.dev/reference/react/Suspense
- lazy: https://react.dev/reference/react/lazy
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect

Decisões absorvidas:

- lazy loading fora do corpo do componente;
- Suspense com fallback significativo;
- Effects somente para sincronização externa;
- dados derivados calculados no render.

## Apple HIG

- HIG: https://developer.apple.com/design/human-interface-guidelines/
- Menus: https://developer.apple.com/design/human-interface-guidelines/menus
- Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- Toolbars: https://developer.apple.com/design/human-interface-guidelines/toolbars

Decisões absorvidas:

- labels curtas e claras;
- ícones familiares e uniformes por grupo;
- controles agrupados por função;
- hierarquia e consistência acima de ornamento.

## Material

- Theming: https://material-web.dev/theming/material-theming/
- Buttons: https://material-web.dev/components/button/
- Icon buttons: https://material-web.dev/components/icon-button/
- Menus: https://material-web.dev/components/menu/

Decisões absorvidas:

- reference -> system -> component tokens;
- papéis explícitos de ênfase;
- menu como superfície temporária ancorada;
- icon button com accessible name.

## Figma

- Components: https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
- Variants: https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants
- Component properties: https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties

Decisões absorvidas:

- componente principal e instâncias;
- propriedades independentes para type, size, state e conteúdo;
- reduzir overrides e variantes combinatórias.

## TMD

- How we think about design: https://tdm.com/handbook/design/how-we-think-about-design
- Design process: https://tdm.com/handbook/design/what-is-our-design-process
- Role of design: https://tdm.com/handbook/design/whats-the-role-of-design-at-tdm

Decisões absorvidas:

- código como fonte de verdade;
- coerência entre forma e função;
- sistema vivo, não coleção de telas;
- simplicidade com precisão;
- implementação e polish como parte do design.
