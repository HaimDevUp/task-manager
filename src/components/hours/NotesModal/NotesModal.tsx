"use client";

import { useEffect, useState } from "react";
import styles from "./NotesModal.module.scss";

interface NotesModalProps {
  isOpen: boolean;
  title: string;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function NotesModal({
  isOpen,
  title,
  value,
  onSave,
  onClose,
}: NotesModalProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [isOpen, value]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="notes-modal-title"
      >
        <header className={styles.header}>
          <h2 id="notes-modal-title">{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="סגור"
          >
            ×
          </button>
        </header>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="הערות..."
          autoFocus
        />
        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            ביטול
          </button>
          <button
            type="button"
            className={styles.save}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            שמור
          </button>
        </footer>
      </div>
    </div>
  );
}
