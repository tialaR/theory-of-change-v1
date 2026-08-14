import type { DragEvent, KeyboardEvent, ReactNode } from 'react';

type StageId = 'input' | 'activity' | 'output' | 'outcome';

type StageActionDragProps = {
  children?: ReactNode;
  className?: string;
  stageId?: StageId;
  stage?: StageId;
  type?: StageId;
  title?: string;
  label?: string;
  actionLabel?: string;
  description?: string;
  onDragStart?: (event: DragEvent<HTMLElement>, stage: StageId) => void;
  onClick?: () => void;
  onCreateClick?: () => void;
};

export function StageActionDrag({
  children,
  className,
  stageId,
  stage,
  type,
  title,
  label,
  actionLabel,
  description,
  onDragStart,
  onClick,
  onCreateClick,
}: StageActionDragProps) {
  const resolvedStage = stageId ?? stage ?? type ?? 'input';
  const resolvedTitle = title ?? label ?? actionLabel ?? 'Adicionar bloco';
  const resolvedDescription = description ?? 'Arraste, solte e crie.';

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = 'copy';

    const payload = {
      type: resolvedStage,
      stageId: resolvedStage,
      stage: resolvedStage,
      title: resolvedTitle,
      label: resolvedTitle,
      description: resolvedDescription,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.setData('text/plain', JSON.stringify(payload));

    onDragStart?.(event, resolvedStage);
  }

  function handleClick() {
    onCreateClick?.();
    onClick?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleClick();
  }

  return (
    <article
      className={className}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {children}
    </article>
  );
}
