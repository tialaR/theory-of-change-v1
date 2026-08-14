'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '../../domain/auth.types';
import { getUserInitials } from '../../domain/user-initials';
import { logoutAction } from '../../server/logout.action';
import { updateUserAvatarAction } from '../../server/update-user-avatar.action';
import styles from './user-menu.module.sass';

const MENU_GAP = 8;
const VIEWPORT_GAP = 12;

export function UserMenu({ initialUser }: { initialUser: AuthUser }) {
  const t = useTranslations('Auth.userMenu');
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const placeMenu = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const menu = menuRef.current?.getBoundingClientRect();
      if (!trigger || !menu) return;
      const preferredLeft = trigger.right - menu.width;
      setPosition({
        top: Math.min(window.innerHeight - menu.height - VIEWPORT_GAP, trigger.bottom + MENU_GAP),
        left: Math.max(VIEWPORT_GAP, Math.min(preferredLeft, window.innerWidth - menu.width - VIEWPORT_GAP))
      });
    };
    requestAnimationFrame(placeMenu);
    window.addEventListener('resize', placeMenu);
    window.addEventListener('scroll', placeMenu, true);
    return () => {
      window.removeEventListener('resize', placeMenu);
      window.removeEventListener('scroll', placeMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      const insideTrigger = rootRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setFeedback(null);
    const formData = new FormData();
    formData.set('avatar', file);
    const result = await updateUserAvatarAction(formData);
    setBusy(false);
    if (result.ok) {
      setUser(result.user);
      return;
    }
    setFeedback(t(`errors.${result.error}`));
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t('open')}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {user.avatarUrl ? <Image className={styles.avatarImage} src={user.avatarUrl} alt="" width={36} height={36} unoptimized /> : getUserInitials(user.name)}
      </button>

      {open ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className={styles.menu}
          style={{ top: position.top, left: position.left }}
        >
          <div className={styles.profile}>
            <button
              type="button"
              className={styles.avatarButton}
              aria-label={t('changePhoto')}
              title={t('changePhoto')}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <span className={styles.avatarWrap}>
                {user.avatarUrl ? <Image className={styles.profileImage} src={user.avatarUrl} alt="" width={56} height={56} unoptimized /> : <span>{getUserInitials(user.name)}</span>}
              </span>
              <span className={styles.cameraBadge} aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 7.5h3l1.4-2h7.2l1.4 2h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></svg>
              </span>
            </button>
            <div className={styles.identity}>
              <div className={styles.nameRow}>
                <strong>{user.name}</strong>
              </div>
              <span>{user.email}</span>
            </div>
            <input ref={inputRef} className={styles.hiddenInput} type="file" name="avatar" accept="image/png,image/jpeg,image/webp" onChange={handleAvatar} />
          </div>
          {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
          <div className={styles.divider} />
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className={styles.logoutButton}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>
              <span>{t('logout')}</span>
            </button>
          </form>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
