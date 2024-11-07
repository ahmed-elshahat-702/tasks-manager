export interface Note {
  id: string;
  _id: string;
  title: string;
  content: string;
  color: string;
  listId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  color: string;
}

export const colorOptions = [
  { value: "yellow-200", label: "Yellow" },
  { value: "green-200", label: "Green" },
  { value: "blue-200", label: "Blue" },
  { value: "red-200", label: "Red" },
  { value: "purple-200", label: "Purple" },
  { value: "pink-200", label: "Pink" },
  { value: "orange-200", label: "Orange" },
  { value: "gray-200", label: "Gray" },
];
