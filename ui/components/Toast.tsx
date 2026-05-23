import { useEffect, useState, type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";
import { setToastHandler } from "../utils/toast";

interface ToastItem {
  id: number;
  msg: string;
  type: "ok" | "err";
}

let toastId = 0;

export function ToastContainer(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setToastHandler((msg, type) => {
      const id = toastId++;
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    });
    return () => {
      setToastHandler(null);
    };
  }, []);

  return (
    <div
      className={clsx(
        "fixed right-6 bottom-6 z-50 flex flex-col gap-2",
        className,
      )}
      {...rest}
    >
      {toasts.map((t) => (
        <div key={t.id} className={clsx("toast", `toast-${t.type}`)}>
          {t.type === "ok" ? (
            <Icon name="check_circle" size={16} />
          ) : (
            <Icon name="cancel" size={16} />
          )}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
