import { type ComponentProps } from "react";
import clsx from "clsx";
import { NavLink } from "react-router-dom";
import { Icon } from "@ui/components/Icon";
import { ButtonIcon } from "@ui/components/ButtonIcon";
import { useAppStore } from "@ui/store";

export function Sidebar(props: ComponentProps<"aside">) {
  const { className, ...rest } = props;
  const { projects, setNewProjectModalOpen } = useAppStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:cursor-pointer hover:bg-surface0",
      isActive ? "bg-mauve/15 text-mauve" : "text-subtext0",
    );

  return (
    <aside
      className={clsx("border-r border-surface0 bg-crust", className)}
      {...rest}
    >
      <div className="flex h-20 items-center gap-3 px-6 font-semibold text-mauve uppercase">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mauve/15 text-mauve">
          <Icon name="fork_right" size={24} />
        </div>
        git dashboard
      </div>
      <div className="space-y-2 p-4">
        <NavLink to="/" className={linkClass}>
          <Icon name="stacks" size={24} />
          <div>All repositories</div>
        </NavLink>

        <div className="flex items-center justify-between p-2">
          <div className="text-sm font-semibold tracking-wider text-subtext0 uppercase">
            Projects
          </div>{" "}
          <ButtonIcon
            icon="add"
            title="Create project"
            onClick={() => setNewProjectModalOpen(true)}
          />
        </div>

        <div className="space-y-1">
          {projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={linkClass}
            >
              <Icon name="folder_code" size={24} />
              <div className="truncate">{project.name}</div>
            </NavLink>
          ))}
          {projects.length === 0 && (
            <div className="p-2 text-center text-xs text-overlay0 italic">
              No projects yet
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
