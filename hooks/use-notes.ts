import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Note, List, colorOptions } from "@/types/notes";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  color: z.string().min(1, "Color is required"),
  listId: z.string().optional(),
});

export const useNotes = () => {
  const { toast } = useToast();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [movingNoteId, setMovingNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState<UseFormReturn<
    z.infer<typeof formSchema>
  > | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListColor, setNewListColor] = useState("bg-gray-500");
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  const getRandomColor = () => {
    const colors = colorOptions.map((option) => option.value);
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addList = async () => {
    if (newListTitle.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a list title.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingList(true);
    try {
      const response = await axios.post("/api/lists", {
        title: newListTitle.trim(),
        color: newListColor,
      });

      const newList = response.data;

      setIsAddListOpen(false);
      setNewListTitle("");
      setNewListColor(getRandomColor());

      setLists((prevLists) => [...prevLists, newList]);

      toast({
        title: "List Added",
        description: "Your new list has been successfully added.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingList(false);
    }
  };

  const deleteList = async (id: string) => {
    setDeletingListId(id);
    try {
      await axios.delete(`/api/lists/${id}`);

      setLists((prevLists) => prevLists.filter((list) => list._id !== id));
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.listId === id ? { ...note, listId: null } : note
        )
      );

      toast({
        title: "List Deleted",
        description: "The list has been successfully deleted.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingListId(null);
    }
  };

  const addNote = async (
    data: z.infer<typeof formSchema>,
    form: UseFormReturn<z.infer<typeof formSchema>>,
    setIsAddNoteOpen: (open: boolean) => void
  ) => {
    try {
      setIsAddingNote(true);

      const newNote: Omit<Note, "_id"> = {
        id: "",
        title: data.title,
        content: data.content,
        color: data.color,
        listId: data.listId && data.listId !== "no-list" ? data.listId : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await axios.post("/api/notes", newNote);
      await fetchNotes();
      form.reset();
      setIsAddNoteOpen(false);

      toast({
        title: "Note Added",
        description: "Your new note has been successfully added.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      setDeletingNoteId(id);
      await axios.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast({
        title: "Note Deleted",
        description: "Your note has been successfully deleted.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    } finally {
      setDeletingNoteId(null);
    }
  };

  const moveNote = async (
    noteId: string,
    currentListId: string | null,
    newListId: string | null
  ) => {
    try {
      setMovingNoteId(noteId);
      await axios.patch(`/api/notes/${noteId}`, { listId: newListId });
      setNotes((prev) =>
        prev.map((note) =>
          note._id === noteId ? { ...note, listId: newListId } : note
        )
      );
      toast({
        title: "Note Moved",
        description: "Your note has been successfully moved to the new list.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to move note",
        variant: "destructive",
      });
    } finally {
      setMovingNoteId(null);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const notesRes = await axios.get("/api/notes");
      setNotes(notesRes.data);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const listsRes = await axios.get("/api/lists");
      setLists(listsRes.data);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch lists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditNoteOpen(true);
    if (form) {
      form.reset({
        title: note.title,
        content: note.content,
        color: note.color,
        listId: note.listId || "no-list",
      });
    }
  };

  const handleUpdateNote = async (data: {
    _id?: string;
    title: string;
    content: string;
    color: string;
    listId?: string;
  }) => {
    if (!data._id) return;

    setIsUpdatingNote(true);
    try {
      const response = await axios.patch(`/api/notes/${data._id}`, {
        title: data.title,
        content: data.content,
        color: data.color,
        listId: data.listId === "no-list" ? null : data.listId,
      });

      if (response.data) {
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNote(false);
    }
  };

  return {
    addList,
    deleteList,
    isAddingNote,
    deletingNoteId,
    movingNoteId,
    isLoading,
    notes,
    lists,
    setNotes,
    setLists,
    addNote,
    deleteNote,
    moveNote,
    fetchNotes,
    fetchLists,
    handleEditNote,
    handleUpdateNote,
    isEditNoteOpen,
    setIsEditNoteOpen,
    editingNote,
    setEditingNote,
    form,
    setForm,
    newListTitle,
    setNewListTitle,
    newListColor,
    setNewListColor,
    isAddListOpen,
    setIsAddListOpen,
    isAddingList,
    deletingListId,
    newTagTitle,
    setNewTagTitle,
    selectedTag,
    setSelectedTag,
    getRandomColor,
    isUpdatingNote,
  };
};
