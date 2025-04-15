export type Task = {
    id: number;
    title: string;
    category: string;
    description: string;
    weight: number;
    files?: { url: string; name: string }[];
  };

  export type UserTaskData = {
    solved_tasks: number[];
  };
  
  export type TasksResponse = {
    tasks: Task[];
    user?: UserTaskData; 
  };