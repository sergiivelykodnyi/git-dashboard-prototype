type ToastHandler = (msg: string, type: "ok" | "err") => void;

let handler: ToastHandler | null = null;

export function setToastHandler(fn: ToastHandler | null) {
  handler = fn;
}

export function toast(msg: string, type: "ok" | "err" = "ok") {
  handler?.(msg, type);
}
