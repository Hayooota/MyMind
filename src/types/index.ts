export type NotionColor =
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export interface Task {
  id: string;
  title: string;
  color: NotionColor;
  x: number;
  y: number;
  completed: boolean;
  collapsed: boolean;
  subtasks: Task[];
  parentId?: string;
}

export interface TodoList {
  id: string;
  name: string;
  tasks: Task[];
}
