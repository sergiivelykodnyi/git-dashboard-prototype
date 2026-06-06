import { type ComponentProps } from "react";
import clsx from "clsx";
import { useLocation, matchPath } from "react-router-dom";
import { Icon } from "@ui/components/Icon";
import { useServices } from "@ui/context/ServicesContext";
import type { ThemeMode } from "@ui/services/interfaces/IAppService";
import { observer } from "mobx-react-lite";
import { ButtonIcon } from "@ui/components/ButtonIcon";
import {
  Dropdown,
  DropdownItem,
  DropdownAction,
} from "@ui/components/Dropdown";
import { pluralize } from "@ui/utilities/pluralize";

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
}

export const Header = observer(function Header({
  onRefresh,
  refreshing,
  onFetchAll,
  fetching,
  className,
  ...rest
}: Readonly<Props>) {
  const location = useLocation();
  const match = matchPath({ path: "/projects/:projectId" }, location.pathname);
  const projectId = match?.params.projectId;

  const { appService } = useServices();

  const currentProject = projectId
    ? appService.projects.find((p) => p.id === projectId)
    : null;
  const title = currentProject ? currentProject.name : "All repositories";
  const reposCount =
    title === "All repositories" ? appService.repos.length : currentProject?.repos.length;
  const isAllRepos = title === "All repositories";

  return (
    <header
      className={clsx(
        "sticky top-0 z-10 h-20 border-b border-surface0 bg-mantle px-6",
        className,
      )}
      {...rest}
    >
      <div className="flex h-full items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-semibold">
            {title}
          </h1>
          <div className="flex items-center gap-1 text-xs text-subtext0">
            {isAllRepos ? (
              <>
                <div>{pluralize(appService.projects.length, "project")}</div>
                <div>•</div>
                {typeof reposCount === "number" && (
                  <div>
                    {pluralize(reposCount, "repository", "repositories")}
                  </div>
                )}
              </>
            ) : (
              typeof reposCount === "number" && (
                <div>{pluralize(reposCount, "repository", "repositories")}</div>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appService.lastRefresh && (
            <span className="px-2 py-1 text-xs text-overlay0">
              Updated {appService.lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Dropdown
            triggerIcon={themeIcons[appService.themeMode]}
            triggerTitle="Switch theme"
          >
            <DropdownItem>
              <DropdownAction
                isActive={appService.themeMode === "system"}
                onClick={() => appService.setThemeMode("system")}
              >
                <Icon name="contrast" className="menu-item-icon" size={16} />
                System
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction
                isActive={appService.themeMode === "dark"}
                onClick={() => appService.setThemeMode("dark")}
              >
                <Icon name="dark_mode" className="menu-item-icon" size={16} />
                Dark
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction
                isActive={appService.themeMode === "light"}
                onClick={() => appService.setThemeMode("light")}
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
              <DropdownAction onClick={() => appService.setNewProjectModalOpen(true)}>
                <Icon
                  className="menu-item-icon"
                  name="create_new_folder"
                  size={16}
                />
                Create project
              </DropdownAction>
            </DropdownItem>
            <DropdownItem>
              <DropdownAction onClick={() => appService.setAddRepoModalOpen(true)}>
                <Icon className="menu-item-icon" name="add_2" size={16} />
                Add repository
              </DropdownAction>
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
});
