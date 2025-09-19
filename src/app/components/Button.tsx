/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type ActionType = "edit" | "delete";

type ActionButtonProps = {
  item: any;
  type: ActionType;
};

function ActionButton({ item, type }: ActionButtonProps) {
  const handleClick = () => {
    console.log(`${type.toUpperCase()} clicked`, item);

    if (type === "edit") {
      alert(`Edit ${item.id}`);
    } else if (type === "delete") {
      alert(`Delete ${item.id}`);
    }
  };

  const baseStyle = "px-2 py-1 rounded text-sm font-medium cursor-pointer";
  const colorClass =
    type === "edit"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-red-500 text-white hover:bg-red-600";

  return (
    <button className={`${baseStyle} ${colorClass}`} onClick={handleClick}>
      {type === "edit" ? "Edit" : "Delete"}
    </button>
  );
}

export default ActionButton;
