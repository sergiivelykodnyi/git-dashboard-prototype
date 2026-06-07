import type { ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "@ui/components/Icon";
import styles from "./button-icon.module.css";

interface Props extends ComponentProps<"button"> {
  icon: string;
  isLoading?: boolean;
}

export function ButtonIcon(props: Readonly<Props>) {
  const { className, icon, isLoading, ...rest } = props;

  return (
    <button
      className={clsx(styles.buttonIcon, className)}
      type="button"
      {...rest}
    >
      {isLoading ? (
        <span className="spinner" />
      ) : (
        <Icon name={icon} size={24} />
      )}
    </button>
  );
}
