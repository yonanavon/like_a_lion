"use client";

import { TASK_ICONS } from "@/lib/icons";

interface IconPickerProps {
  selected: string;
  color: string;
  onSelect: (iconName: string) => void;
}

export default function IconPicker({ selected, color, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
      {Object.entries(TASK_ICONS).map(([name, Icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
            selected === name
              ? "ring-2 ring-blue-500 bg-white shadow-sm"
              : "hover:bg-white"
          }`}
        >
          <Icon size={24} color={selected === name ? color : "#6B7280"} />
        </button>
      ))}
    </div>
  );
}
