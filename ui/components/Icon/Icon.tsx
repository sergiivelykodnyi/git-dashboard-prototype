import React, { type ComponentProps } from "react";
import clsx from "clsx";
import styles from "./icon.module.css";

interface Props extends ComponentProps<"span"> {
  name: string;
  size?: number;
  fill?: boolean;
}

export function Icon(props: Readonly<Props>) {
  const { name, size, className, style, ...rest } = props;
  const iconStyle: React.CSSProperties = {
    ...style,
  };

  if (size !== undefined) {
    iconStyle.fontSize = `${size}px`;
    iconStyle.width = `${size}px`;
    iconStyle.height = `${size}px`;
  }

  return (
    <span
      className={clsx("material-symbols-outlined", styles.icon, className)}
      style={iconStyle}
      {...rest}
    >
      {name}
    </span>
  );
}
