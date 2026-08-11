export const PUBLIC_NAV_ITEMS = [
  { href: '/guia-de-aprendizado', label: 'Guia' },
  { href: '/exemplos', label: 'Exemplos' },
  { href: '/referencias', label: 'Referências' },
  { href: '/canvas', label: 'Canvas' }
] as const;

const HIDDEN_HEADER_ROUTES = [
  '/canvas',
  '/exemplos/resultado/interativo',
  '/exemplos/visao-do-fluxo/interativo'
] as const;

export function isPublicNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function shouldHidePublicHeader(pathname: string) {
  if (pathname.startsWith('/canvas')) return true;

  return HIDDEN_HEADER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
