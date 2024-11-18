export interface Task {
  _id: string;
  title: string;
  date?: string;
  time?: string;
  subtasks?: string[];
  listId?: string | null;
  owner: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
