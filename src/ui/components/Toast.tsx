import { observer } from "mobx-react-lite";
import { useServices } from "@ui/hooks/useServices";
import type { ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "@ui/components/Icon";

export const ToastContainer = observer(function ToastContainer(
  props: ComponentProps<"div">,
) {
  const { className, ...rest } = props;
  const { appService } = useServices();

  return (
    <div
      className={clsx(
        "fixed right-6 bottom-6 z-50 flex flex-col gap-2",
        className,
      )}
      {...rest}
    >
      {appService.toasts.map((t) => (
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
});
