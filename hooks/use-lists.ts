import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Note, colorOptions } from "@/types/notes";
import { List } from "@/types/lists";
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  color: z.string().min(1, "Color is required"),
  listId: z.string().optional(),
});

export const useLists = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [form, setForm] = useState<UseFormReturn<
    z.infer<typeof formSchema>
  > | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListColor, setNewListColor] = useState("bg-gray-500");
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

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


  return {
    addList,
    deleteList,
    isLoading,
    notes,
    lists,
    setNotes,
    setLists,
    fetchLists,
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
    getRandomColor,
  };
};