import React from "react";
import { Task } from "@/types/tasks";
import { List } from "@/types/lists";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskCardProps {
  task: Task;
  lists: List[];
  onDelete: () => void;
  onUpdate: (updatingTaskId: string, data: Partial<Task>) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  handleEditTask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  lists,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
  handleEditTask,
}) => {
  const handleCompletedChange = (checked: boolean) => {
    onUpdate(task._id, { completed: checked });
  };

  // Get list data from listId
  const getListData = () => {
    if (!task.listId) return { title: "No List", color: "bg-gray-500" };
    const list = lists.find((list) => list._id === task.listId);
    return list
      ? { title: list.title, color: list.color }
      : { title: "No List", color: "bg-gray-500" };
  };
  const listData = getListData();

  function convertTo12HourFormat(time: String) {
    const [hours, minutes] = time?.split(":").map(Number);

    const suffix = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight.

    return `${adjustedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  return (
    <div
      className={cn(
        "group w-full relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDeleting && "opacity-50",
        task.completed && "bg-gray-50"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleCompletedChange}
          disabled={isUpdating}
          className="mt-1.5"
        />

        <div className="flex-1 overflow-x-auto pb-2  space-y-1">
          {/* title */}
          <h3
            className={cn(
              "font-medium break-words",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>

          <div className="flex items-center gap-2">
            {/* date */}
            {task.date && (
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(task.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            )}
            {/* time */}
            {task.time && (
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {/* {task.time} */}
                {convertTo12HourFormat(task.time)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* list */}
            <div
              className={`rounded-full w-fit px-4 py-1 text-center text-sm bg-${listData.color} shadow`}
            >
              <p>{listData.title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
          {/* edit button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditTask(task)}
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
