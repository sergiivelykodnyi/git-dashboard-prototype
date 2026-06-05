import type { ComponentProps, PropsWithChildren } from "react";
import {
  Button as HeadlessButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import clsx from "clsx";
import { Button } from "@ui/components/Button";
import { Icon } from "@ui/components/Icon";

interface DropdownProps extends ComponentProps<"div"> {
  triggerIcon?: string;
  triggerTitle?: string;
  triggerText?: string;
  triggerClassName?: string;
}

export function Dropdown(props: DropdownProps) {
  const {
    children,
    triggerIcon = "more_vert",
    triggerText,
    triggerClassName,
  } = props;
  const isTextTrigger = !!triggerText;

  return (
    <Menu>
      {isTextTrigger ? (
        <MenuButton as={Button} variant="primary" className={triggerClassName}>
          <Icon name={triggerIcon} size={16} />
          {triggerText}
        </MenuButton>
      ) : (
        <MenuButton className={clsx("button-icon", triggerClassName)}>
          <Icon name={triggerIcon} size={24} />
        </MenuButton>
      )}
      <MenuItems className="menu" transition anchor="bottom end">
        {children}
      </MenuItems>
    </Menu>
  );
}

export function DropdownItem(props: PropsWithChildren) {
  const { children } = props;

  return <MenuItem>{children}</MenuItem>;
}

export function DropdownItemSeparator(props: ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <MenuSeparator
      role="separator"
      className={clsx("menu-separator", className)}
      {...rest}
    />
  );
}

interface DropdownActionProps extends ComponentProps<"button"> {
  isActive?: boolean;
}

export function DropdownAction(props: Readonly<DropdownActionProps>) {
  const { children, className, isActive = false, ...rest } = props;

  return (
    <HeadlessButton
      role="menuitem"
      className={clsx("menu-item", isActive && "menu-item-active", className)}
      type="button"
      {...rest}
    >
      {children}
    </HeadlessButton>
  );
}
