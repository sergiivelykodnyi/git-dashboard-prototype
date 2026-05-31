import { type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "@ui/components/Icon";
import { useAppStore, type ThemeMode } from "@ui/store";
import { ButtonIcon } from "@ui/components/Button";
import {
  Dropdown,
  DropdownItem,
  DropdownAction,
} from "@ui/components/Dropdown";

const themeIcons: Record<ThemeMode, string> = {
  system: "contrast",
  dark: "dark_mode",
  light: "light_mode",
};

interface Props extends ComponentProps<"header"> {
  onRefresh: () => void;
  refreshing: boolean;
  onFetchAll: () => void;
  fetching: boolean;
  onAddRepo: () => void;
  onCreateProject: () => void;
}

export function Header(props: Readonly<Props>) {
  const {
    onRefresh,
    refreshing,
    onFetchAll,
    fetching,
    onAddRepo,
    onCreateProject,
    className,
    ...rest
  } = props;
  const { lastRefresh, themeMode, setThemeMode } = useAppStore();

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 h-20 border-b border-surface0 bg-mantle px-6",
        className,
      )}
      {...rest}
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-mauve uppercase">
            <Icon name="fork_right" size={24} />
            git dashboard
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="px-2 py-1 text-xs text-overlay0">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Dropdown
            triggerIcon={themeIcons[themeMode]}
            triggerTitle="Switch theme"
          >
            <DropdownItem>
              <DropdownAction
                isActive={themeMode === "system"}
                onClick={() => setThemeMode("system")}
              >
                <Icon name="contrast" className="menu-item-icon" size={16} />
                System
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction
                isActive={themeMode === "dark"}
                onClick={() => setThemeMode("dark")}
              >
                <Icon name="dark_mode" className="menu-item-icon" size={16} />
                Dark
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction
                isActive={themeMode === "light"}
                onClick={() => setThemeMode("light")}
              >
                <Icon name="light_mode" className="menu-item-icon" size={16} />
                Light
              </DropdownAction>
            </DropdownItem>
          </Dropdown>
          <ButtonIcon
            icon="sync"
            isLoading={refreshing}
            title="Refresh all"
            onClick={onRefresh}
            disabled={refreshing}
          />
          <ButtonIcon
            icon="cloud_download"
            isLoading={fetching}
            title="Fetch all"
            onClick={onFetchAll}
            disabled={fetching}
          />
          <Dropdown
            triggerIcon="add_2"
            triggerText="Add"
            triggerClassName="ml-2"
          >
            <DropdownItem>
              <DropdownAction onClick={onCreateProject}>
                <Icon
                  className="menu-item-icon"
                  name="create_new_folder"
                  size={16}
                />
                Create project
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction onClick={onAddRepo}>
                <Icon className="menu-item-icon" name="add_2" size={16} />
                Add repository
              </DropdownAction>
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
