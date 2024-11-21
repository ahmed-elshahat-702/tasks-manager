import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import TaskCard from "../task-card/TaskCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "@/hooks/use-tasks";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Task } from "@/types/tasks";
import { useLists } from "@/hooks/use-lists";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Upcoming = () => {
  const {
    tasks,
    isLoading,
    deletingTaskId,
    isAddingTask,
    isUpdatingTask,
    updatingTaskId,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const { lists, fetchLists } = useLists();

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchLists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Sort tasks by position when they're loaded
    const sortedTasks = [...tasks].sort((a, b) => {
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      return posA - posB;
    });
    setOrderedTasks(sortedTasks);
  }, [tasks]);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      completed: false,
      listId: "",
      position: 0,
    },
  });

  const onSubmit = async (data: {
    title: string;
    date?: string | undefined;
    time?: string | undefined;
    completed: boolean;
    subtasks?: string[] | undefined;
    listId?: string | undefined;
    position?: number | undefined;
  }) => {
    await addTask(data);
    form.reset({
      title: "",
      date: "",
      time: "",
      completed: false,
      listId: "",
      position: 0,
    });
    setIsAddTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const onEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
    form.reset({
      title: task.title,
      date: task.date,
      time: task.time,
      completed: task.completed,
      listId: task.listId || "",
      position: task.position,
    });
  };

  const handleDragEnd = (result: {
    source: { index: number };
    destination: { index: number } | null;
  }) => {
    if (!result.destination) return;

    const items = Array.from(orderedTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the local state
    setOrderedTasks(items);

    // Save the new order to the database
    items.forEach(async (task, index) => {
      await updateTask(task._id, { position: index });
    });
  };

  const TasksSkeleton = () => (
    <div className="grid grid-cols-1 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="relative w-full rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="mb-2">
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <ScrollArea className="h-[calc(100vh-10rem)] ps-2 pr-4 sm:px-4">
        {isLoading ? (
          <TasksSkeleton />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 gap-4"
                >
                  {orderedTasks.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No tasks yet, click + to add your first task
                    </div>
                  ) : (
                    orderedTasks.map((task: Task, index: number) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard
                              task={task}
                              lists={lists}
                              onDelete={() => deleteTask(task._id)}
                              onUpdate={updateTask}
                              isDeleting={deletingTaskId === task._id}
                              isUpdating={updatingTaskId === task._id}
                              handleEditTask={onEditTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                  <Button
                    onClick={() => setIsAddTaskDialogOpen(true)}
                    className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </ScrollArea>
      {/* add task dialog */}
      <Dialog
        open={isAddTaskDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            form.reset({
              title: "",
              date: "",
              time: "",
              completed: false,
              listId: "",
              position: 0,
            });
            setSelectedTask(null);
          }
          setIsAddTaskDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isAddingTask} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isAddingTask} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isAddingTask} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "no-list"}
                      disabled={isAddingTask}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-list">No List</SelectItem>
                        {lists?.map((list) => (
                          <SelectItem key={list._id} value={list._id}>
                            {list.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isAddingTask ? (
                <Button type="submit" disabled>
                  <span className="mr-2">Adding Task...</span>
                  <span className="animate-spin">⏳</span>
                </Button>
              ) : (
                <Button type="submit">Add Task</Button>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* edit task dialog */}
      <Dialog
        open={isEditTaskOpen}
        onOpenChange={(open) => {
          if (!open) {
            form.reset({
              title: "",
              date: "",
              time: "",
              completed: false,
              listId: "",
              position: 0,
            });
            setSelectedTask(null);
          }
          setIsEditTaskOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                if (selectedTask) {
                  await updateTask(selectedTask._id, { ...data });
                  setIsEditTaskOpen(false);
                  setSelectedTask(null);
                  fetchTasks();
                  form.reset({
                    title: "",
                    date: "",
                    time: "",
                    completed: false,
                    listId: "",
                    position: 0,
                  });
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingTask} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        disabled={isUpdatingTask}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" disabled={isUpdatingTask} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "no-list"}
                      disabled={isUpdatingTask}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-list">No List</SelectItem>
                        {lists?.map((list) => (
                          <SelectItem key={list._id} value={list._id}>
                            {list.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdatingTask}>
                {isUpdatingTask ? "Updating..." : "Update Task"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upcoming;
