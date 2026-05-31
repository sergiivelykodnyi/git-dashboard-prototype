import { type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "@ui/components/Icon";

export function Sidebar(props: ComponentProps<"aside">) {
  const { className, ...rest } = props;

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
    </aside>
  );
}
