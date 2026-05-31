import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  useId,
} from "react";
import type { ComponentProps } from "react";
import clsx from "clsx";
import { ButtonIcon } from "@ui/components/Button";
import { Icon } from "@ui/components/Icon";

interface DropdownContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  menuId: string;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "Dropdown components must be rendered within a <Dropdown> provider",
    );
  }
  return context;
}

interface DropdownProps extends ComponentProps<"div"> {
  triggerIcon?: string;
  triggerTitle?: string;
  triggerText?: string;
  triggerClassName?: string;
}

export function Dropdown(props: DropdownProps) {
  const {
    children,
    className,
    triggerIcon = "more_vert",
    triggerTitle = "More actions",
    triggerText,
    triggerClassName,
    ...rest
  } = props;
  const [isOpenMenu, setMenu] = useState(false);
  const triggerId = useId();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape press or when clicking outside
  useEffect(() => {
    if (!isOpenMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        // Put focus back on the trigger button
        const trigger = document.getElementById(triggerId);
        trigger?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpenMenu, triggerId]);

  return (
    <DropdownContext.Provider
      value={{
        isOpen: isOpenMenu,
        setOpen: setMenu,
        triggerId,
        menuId,
      }}
    >
      <div
        ref={containerRef}
        className={clsx("menu-wrapper", className)}
        {...rest}
      >
        {triggerText ? (
          <button
            id={triggerId}
            type="button"
            className={clsx("button button-primary", triggerClassName)}
            aria-haspopup="menu"
            aria-expanded={isOpenMenu}
            aria-controls={menuId}
            onClick={() => setMenu((isOpen) => !isOpen)}
          >
            <Icon name={triggerIcon} size={16} />
            {triggerText}
          </button>
        ) : (
          <ButtonIcon
            id={triggerId}
            icon={triggerIcon}
            title={triggerTitle}
            aria-haspopup="menu"
            aria-expanded={isOpenMenu}
            aria-controls={menuId}
            onClick={() => setMenu((isOpen) => !isOpen)}
          />
        )}
        {isOpenMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenu(false)}
            />
            <DropdownMenu>{children}</DropdownMenu>
          </>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenu(props: ComponentProps<"ul">) {
  const { children, className, onClick, ...rest } = props;
  const { menuId, triggerId } = useDropdown();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLUListElement>) => {
      e.stopPropagation();
      onClick?.(e);
    },
    [onClick],
  );

  return (
    <ul
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      className={clsx("menu", className)}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </ul>
  );
}

export function DropdownItem(props: ComponentProps<"li">) {
  const { children, className, ...rest } = props;

  return (
    <li role="none" className={className} {...rest}>
      {children}
    </li>
  );
}

export function DropdownItemSeparator(props: ComponentProps<"li">) {
  const { className, ...rest } = props;

  return (
    <li
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
  const { children, className, isActive = false, onClick, ...rest } = props;
  const { setOpen } = useDropdown();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Close dropdown when an action is clicked
      setOpen(false);
      onClick?.(e);
    },
    [onClick, setOpen],
  );

  return (
    <button
      role="menuitem"
      className={clsx("menu-item", isActive && "menu-item-active", className)}
      type="button"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
