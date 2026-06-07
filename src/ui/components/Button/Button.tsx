import type { ReactNode } from "react";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from "@headlessui/react";
import clsx from "clsx";
import css from "./button.module.css";

export interface ButtonProps extends HeadlessButtonProps {
  variant?: "primary" | "secondary";
  children?: ReactNode;
}

export function Button(props: Readonly<ButtonProps>) {
  const { variant = "primary", className, children, ...rest } = props;
  return (
    <HeadlessButton
      className={clsx(css.button, css[variant], className)}
      {...rest}
    >
      {children}
    </HeadlessButton>
  );
}
