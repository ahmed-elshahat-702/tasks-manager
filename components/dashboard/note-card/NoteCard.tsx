import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Note } from "@/types/notes";
import { List } from "@/types/lists";
import { useToast } from "@/hooks/use-toast";

interface NoteCardProps {
  note: Note & { _id: string };
  handleEditNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  moveNote: (
    noteId: string,
    currentListId: string | null,
    newListId: string | null
  ) => void;
  lists: List[];
  deletingNoteId: string | null;
  movingNoteId: string | null;
  setSelectedNoteForList: (noteId: string | null) => void;
  setIsAddListOpen: (isOpen: boolean) => void;
}

const NoteCard = ({
  note,
  handleEditNote,
  deleteNote,
  lists,
  deletingNoteId,
}: NoteCardProps) => {
  const { toast } = useToast();

  if (!note || !note._id || typeof note._id !== "string") {
    toast({ title: "Invalid note data received" });
    return null;
  }

  // Get list data from listId
  const getListData = () => {
    if (!note.listId) return { title: "No List", color: "bg-gray-500" };
    const list = lists.find((list) => list._id === note.listId);
    return list
      ? { title: list.title, color: list.color }
      : { title: "No List", color: "bg-gray-500" };
  };

  const listData = getListData();

  return (
    <div
      key={note._id}
      className={cn("relative rounded-lg p-4 shadow-sm flex flex-col gap-1", {
        "bg-yellow-200": note.color === "yellow-200",
        "bg-green-200": note.color === "green-200",
        "bg-blue-200": note.color === "blue-200",
        "bg-red-200": note.color === "red-200",
        "bg-purple-200": note.color === "purple-200",
        "bg-pink-200": note.color === "pink-200",
        "bg-orange-200": note.color === "orange-200",
        "bg-gray-200": note.color === "gray-200",
      })}
    >
      <div className="flex items-center absolute top-1 right-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleEditNote(note)}
          aria-label="Edit note"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete note"
              disabled={deletingNoteId === note._id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteNote(note._id)}
                disabled={deletingNoteId === note._id}
              >
                {deletingNoteId === note._id ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Title Section */}
      <div>
        <div className="text-xs text-gray-500 font-medium">Title</div>
        <h3 className="font-semibold">{note.title}</h3>
      </div>
      {/* Content Section */}
      <div>
        <div className="text-xs text-gray-500 font-medium">Content</div>
        <p className="text-sm">{note.content}</p>
      </div>

      {/* List Section */}
      <div>
        <div className="text-xs text-gray-500 font-medium mb-1">List</div>
        <div
          className={`rounded-full w-fit px-4 py-1 text-center text-sm bg-${listData.color} shadow`}
        >
          <p>{listData.title}</p>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
