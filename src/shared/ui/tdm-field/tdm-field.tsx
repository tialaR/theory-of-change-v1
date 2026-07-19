'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes
} from 'react';
import styles from './tdm-field.module.sass';

export type TdmFieldSize = 'sm' | 'md';

export type TdmFieldProps = {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  leadingAdornment?: ReactNode;
  trailingAdornment?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  filled?: boolean;
  size?: TdmFieldSize;
  className?: string;
  children: ReactNode;
};

type ControlProps = {
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
  className?: string;
};

function joinDescribedBy(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function TdmField({
  label,
  description,
  error,
  required = false,
  leadingAdornment,
  trailingAdornment,
  disabled = false,
  readOnly = false,
  invalid,
  filled = false,
  size = 'md',
  className = '',
  children
}: TdmFieldProps) {
  const reactId = useId();
  const fieldId = `tdm-field-${reactId}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const isInvalid = invalid ?? Boolean(error);

  const control = Children.only(children);

  if (!isValidElement(control)) {
    return null;
  }

  const controlElement = control as ReactElement<ControlProps>;
  const controlId = controlElement.props.id ?? fieldId;
  const controlClassName = [styles.control, controlElement.props.className].filter(Boolean).join(' ');

  const enhancedControl = cloneElement(controlElement, {
    id: controlId,
    disabled: controlElement.props.disabled ?? disabled,
    readOnly: controlElement.props.readOnly ?? readOnly,
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': joinDescribedBy(controlElement.props['aria-describedby'], descriptionId, errorId),
    className: controlClassName
  });

  return (
    <div
      className={[
        styles.field,
        isInvalid ? styles.invalid : '',
        disabled ? styles.disabled : '',
        readOnly ? styles.readonly : '',
        filled ? styles.filled : '',
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label ? (
        <label className={styles.label} htmlFor={controlId}>
          <span>{label}</span>
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}

      <div className={styles.controlShell}>
        {leadingAdornment ? (
          <span className={styles.adornment} aria-hidden="true">
            {leadingAdornment}
          </span>
        ) : null}
        {enhancedControl}
        {trailingAdornment ? <span className={styles.adornment}>{trailingAdornment}</span> : null}
      </div>

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type TdmInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TdmInput = forwardRef<HTMLInputElement, TdmInputProps>(function TdmInput(
  { className = '', ...props },
  ref
) {
  return <input ref={ref} className={[styles.input, className].filter(Boolean).join(' ')} {...props} />;
});

export type TdmTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TdmTextarea = forwardRef<HTMLTextAreaElement, TdmTextareaProps>(function TdmTextarea(
  { className = '', ...props },
  ref
) {
  return <textarea ref={ref} className={[styles.textarea, className].filter(Boolean).join(' ')} {...props} />;
});
