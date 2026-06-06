export interface ToastItem {
  id: number;
  msg: string;
  type: "ok" | "err";
}

export interface IToastService {
  toasts: ToastItem[];
  show(msg: string, type?: "ok" | "err"): void;
  dismiss(id: number): void;
}
