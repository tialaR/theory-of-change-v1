'use client';

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import {
  TdmIconButton,
  type TdmIconButtonSize,
  type TdmIconButtonVariant
} from '../tdm-icon-button';
import styles from './tdm-menu.module.sass';

export type TdmMenuAlign = 'start' | 'end';
export type TdmMenuTone = 'default' | 'danger';

export type TdmMenuItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
  tone?: TdmMenuTone;
  trailingContent?: ReactNode;
};

export type TdmMenuProps = {
  triggerLabel: string;
  triggerIcon: ReactNode;
  items: readonly TdmMenuItem[];
  heading?: string;
  align?: TdmMenuAlign;
  tooltip?: string;
  disabled?: boolean;
  busy?: boolean;
  triggerVariant?: TdmIconButtonVariant;
  triggerSize?: TdmIconButtonSize;
  onOpenChange?: (open: boolean) => void;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

const MENU_GAP_PX = 8;
const VIEWPORT_PADDING_PX = 10;

function MenuItemIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className={styles.itemIcon} aria-hidden="true">
      {icon}
    </span>
  );
}

function resolveItemClassName(tone: TdmMenuTone) {
  return [styles.item, tone === 'danger' ? styles.itemDanger : ''].filter(Boolean).join(' ');
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function calculateMenuPosition(
  trigger: DOMRect,
  menu: DOMRect,
  align: TdmMenuAlign
): MenuPosition {
  const desiredLeft = align === 'end' ? trigger.right - menu.width : trigger.left;
  const maximumLeft = window.innerWidth - menu.width - VIEWPORT_PADDING_PX;
  const belowTop = trigger.bottom + MENU_GAP_PX;
  const fitsBelow = belowTop + menu.height <= window.innerHeight - VIEWPORT_PADDING_PX;
  const top = fitsBelow ? belowTop : trigger.top - menu.height - MENU_GAP_PX;

  return {
    top: clamp(top, VIEWPORT_PADDING_PX, window.innerHeight - menu.height - VIEWPORT_PADDING_PX),
    left: clamp(desiredLeft, VIEWPORT_PADDING_PX, maximumLeft),
    width: menu.width
  };
}

export function TdmMenu({
  triggerLabel,
  triggerIcon,
  items,
  heading,
  align = 'end',
  tooltip,
  disabled = false,
  busy = false,
  triggerVariant = 'subtle',
  triggerSize = 'md',
  onOpenChange
}: TdmMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);

  const setMenuOpen = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
      if (!nextOpen) setPositioned(false);
    },
    [onOpenChange]
  );

  const closeMenu = useCallback(
    (restoreFocus = false) => {
      setMenuOpen(false);
      if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
    },
    [setMenuOpen]
  );

  const focusFirstEnabledItem = useCallback(() => {
    const firstEnabled = itemRefs.current.find((item) => item && !item.disabled);
    firstEnabled?.focus();
  }, []);

  const openMenu = useCallback(() => {
    if (disabled || busy) return;
    setMenuOpen(true);
    window.requestAnimationFrame(focusFirstEnabledItem);
  }, [busy, disabled, focusFirstEnabledItem, setMenuOpen]);

  const toggleMenu = useCallback(() => {
    if (open) {
      closeMenu(false);
      return;
    }
    openMenu();
  }, [closeMenu, open, openMenu]);

  const updatePosition = useCallback(() => {
    const menuElement = menuRef.current;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const menu = menuElement?.getBoundingClientRect();
    if (!trigger || !menu || !menuElement) return;
    const position = calculateMenuPosition(trigger, menu, align);
    menuElement.style.top = `${position.top}px`;
    menuElement.style.left = `${position.left}px`;
    setPositioned(true);
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeMenu(true);
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [closeMenu, open, updatePosition]);

  function enabledItems() {
    return itemRefs.current.filter((item): item is HTMLButtonElement => Boolean(item && !item.disabled));
  }

  function focusItem(index: number) {
    const enabled = enabledItems();
    if (enabled.length === 0) return;
    const normalizedIndex = (index + enabled.length) % enabled.length;
    enabled[normalizedIndex]?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = enabledItems();
    const currentIndex = enabled.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(currentIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(currentIndex - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusItem(enabled.length - 1);
    }
  }

  async function handleSelect(item: TdmMenuItem) {
    if (item.disabled || busy) return;
    closeMenu(true);
    await item.onSelect();
  }

  const openState = open ? 'true' : 'false';

  let menuPortal: ReactNode = null;
  if (open && typeof document !== 'undefined') {
    const menuClassName = [styles.menu, positioned ? styles.positioned : ''].filter(Boolean).join(' ');
    menuPortal = createPortal(
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={heading ?? triggerLabel}
        aria-busy={busy || undefined}
        className={menuClassName}
        onKeyDown={handleMenuKeyDown}
      >
        {heading ? <div className={styles.heading}>{heading}</div> : null}
        <div className={styles.items}>
          {items.map((item, index) => {
            const tone = item.tone ?? 'default';
            const itemClassName = resolveItemClassName(tone);
            const itemDisabled = Boolean(item.disabled || busy);

            return (
              <button
                key={item.id}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                disabled={itemDisabled}
                className={itemClassName}
                onClick={() => handleSelect(item)}
              >
                <MenuItemIcon icon={item.icon} />
                <span className={styles.itemLabel}>{item.label}</span>
                {item.trailingContent ? (
                  <span className={styles.trailing}>{item.trailingContent}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <span className={styles.root} data-menu-open={openState} data-export-menu-open={openState}>
      <TdmIconButton
        ref={triggerRef}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        tooltip={tooltip}
        disabled={disabled || busy}
        variant={triggerVariant}
        size={triggerSize}
        onClick={toggleMenu}
      >
        {triggerIcon}
      </TdmIconButton>
      {menuPortal}
    </span>
  );
}
