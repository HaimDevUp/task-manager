import { toast } from "sonner";

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : fallback;
  toast.error(message);
}
