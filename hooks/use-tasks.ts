import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import axios from "axios";
import { Task } from "@/types/tasks";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  subtasks: z.array(z.string()).nullable().optional(),
  listId: z.string().nullable().optional(),
  position: z.number().nullable().optional(),
});

export const useTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/tasks");
      setTasks(response.data);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (data: z.infer<typeof taskSchema>) => {
    setIsAddingTask(true);
    try {
      const newTask = {
        title: data.title,
        date: data.date,
        time: data.time,
        subtasks: data.subtasks,
        listId: data.listId && data.listId !== "no-list" ? data.listId : null,
        position: data.position,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await axios.post("/api/tasks", newTask);
      setTasks((prev) => [...prev, response.data]);
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      return response.data;
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data.message || "An error occurred"
          : "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setIsAddingTask(false);
    }
  };

  const updateTask = async (
    taskId: string,
    data: Partial<z.infer<typeof taskSchema>>
  ) => {
    setIsUpdatingTask(true);
    setUpdatingTaskId(taskId);
    try {
      const response = await axios.patch(`/api/tasks/${taskId}`, data);
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? response.data : task))
      );
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      return response.data;
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingTask(false);
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  return {
    tasks,
    isLoading,
    deletingTaskId,
    isUpdatingTask,
    isAddingTask,
    updatingTaskId,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};
