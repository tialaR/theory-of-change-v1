export function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toLocaleUpperCase('pt-BR');
  return `${parts[0].charAt(0)}${parts.at(-1)?.charAt(0) ?? ''}`.toLocaleUpperCase('pt-BR');
}
