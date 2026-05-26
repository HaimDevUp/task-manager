import styles from "./TaskDetail.module.scss";

interface InlineEditActionsProps {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  saveLabel?: string;
}

export function InlineEditActions({
  onSave,
  onCancel,
  loading = false,
  saveLabel = "שמירה",
}: InlineEditActionsProps) {
  return (
    <div className={styles.inlineActions}>
      <button
        type="button"
        className={styles.saveInlineBtn}
        onClick={onSave}
        disabled={loading}
      >
        {saveLabel}
      </button>
      <button
        type="button"
        className={styles.cancelInlineBtn}
        onClick={onCancel}
        disabled={loading}
      >
        ביטול
      </button>
    </div>
  );
}
