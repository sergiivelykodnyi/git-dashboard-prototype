import { makeAutoObservable } from "mobx";
import type { IToastService, ToastItem } from "@ui/services/interfaces/IToastService";

export class ToastService implements IToastService {
  toasts: ToastItem[] = [];
  private nextId = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  show(msg: string, type: "ok" | "err" = "ok") {
    const id = this.nextId++;
    this.toasts.push({ id, msg, type });
    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}
