'use client';

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';
import styles from '../canvas-workspace/canvas-workspace.module.sass';

type ClearableFieldSize = 'sm' | 'md';

type ClearableFieldProps = {
  value: string;
  onClear: () => void;
  children: ReactNode;
  label: string;
  editLabel?: string;
  multiline?: boolean;
  size?: ClearableFieldSize;
  showEditWhenIdle?: boolean;
};

export function ClearableField({
  value,
  onClear,
  children,
  label,
  editLabel = label,
  multiline = false,
  size = 'md',
  showEditWhenIdle = false
}: ClearableFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [hasFieldFocus, setHasFieldFocus] = useState(false);
  const classNames = [
    styles.clearableField,
    multiline ? styles.clearableFieldMultiline : '',
    size === 'sm' ? styles.clearableFieldSmall : '',
    showEditWhenIdle ? styles.clearableFieldEditable : '',
    'nodrag',
    'nopan'
  ].filter(Boolean).join(' ');

  function focusField() {
    fieldRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')?.focus();
  }

  function handleClear(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onClear();
    requestAnimationFrame(focusField);
  }

  function handleEdit(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    focusField();
  }

  function stopPointerPropagation(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleBlurCapture() {
    requestAnimationFrame(() => {
      setHasFieldFocus(Boolean(fieldRef.current?.contains(document.activeElement)));
    });
  }

  const shouldShowClear = hasFieldFocus && value.length > 0;
  const shouldShowEdit = showEditWhenIdle && !hasFieldFocus;

  return (
    <div
      ref={fieldRef}
      className={classNames}
      data-field-focus={hasFieldFocus}
      onFocusCapture={() => setHasFieldFocus(true)}
      onBlurCapture={handleBlurCapture}
    >
      {children}
      {shouldShowClear ? (
        <button
          type="button"
          className={styles.clearFieldButton}
          aria-label={label}
          data-tooltip={label}
          onPointerDown={stopPointerPropagation}
          onClick={handleClear}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
      {shouldShowEdit ? (
        <button
          type="button"
          className={`${styles.clearFieldButton} ${styles.editFieldButton}`}
          aria-label={editLabel}
          data-tooltip={editLabel}
          onPointerDown={stopPointerPropagation}
          onClick={handleEdit}
        >
          <span aria-hidden="true">✎</span>
        </button>
      ) : null}
    </div>
  );
}
