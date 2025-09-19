import React, { useState, useRef, useEffect } from "react";

// Generic type T: bất kỳ object nào có id và label
interface MultiSelectProps<T> {
  options: T[];
  value: T[];
  onChange: (selected: T[]) => void;
  getId: (item: T) => string | number; // cách lấy id
  getLabel: (item: T) => string; // cách lấy label hiển thị
  placeholder?: string;
}

export default function MultiSelect<T>({
  options,
  value,
  onChange,
  getId,
  getLabel,
  placeholder = "Chọn...",
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelect = (option: T) => {
    const id = getId(option);
    if (value.find((v) => getId(v) === id)) {
      onChange(value.filter((v) => getId(v) !== id));
    } else {
      onChange([...value, option]);
    }
  };

  const removeItem = (id: string | number) => {
    onChange(value.filter((v) => getId(v) !== id));
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="border rounded-md px-3 py-2 flex flex-wrap items-center gap-1 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {value.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}
        {value.map((v) => (
          <span
            key={getId(v)}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1 text-sm"
          >
            {getLabel(v)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(getId(v));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <span className="flex-1"></span>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md max-h-60 overflow-auto shadow-lg">
          {options.map((option) => (
            <div
              key={getId(option)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                value.find((v) => getId(v) === getId(option))
                  ? "bg-blue-50"
                  : ""
              }`}
              onClick={() => toggleSelect(option)}
            >
              {getLabel(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
