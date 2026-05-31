import {
  Dropdown,
  DropdownItem,
  DropdownAction,
} from "@ui/components/Dropdown";
import { Icon } from "@ui/components/Icon";

interface Props {
  onRemove: () => void;
}

export function RepoDropdowActions(props: Readonly<Props>) {
  const { onRemove } = props;

  return (
    <Dropdown>
      <DropdownItem>
        <DropdownAction className="danger" onClick={onRemove}>
          <Icon className="menu-item-icon" name="delete" size={16} />
          Remove
        </DropdownAction>
      </DropdownItem>
    </Dropdown>
  );
}
