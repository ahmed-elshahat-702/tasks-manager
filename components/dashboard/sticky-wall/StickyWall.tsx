import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NoteCard from "../note-card/NoteCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

import React, { useEffect, useMemo, useState } from "react";
import { Note } from "@/types/notes";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { colorOptions } from "@/types/notes";
import { useNotes } from "@/hooks/use-notes";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLists } from "@/hooks/use-lists";

const StickyWall = ({
  searchTerm,
  selectedListId,
  setSelectedNoteForList,
  setIsAddListOpen,
}: {
  setPendingNoteUpdate: (update: {
    noteId: string;
    newListId: string | null;
  }) => void;
  selectedNoteForList: string | null;
  searchTerm: string | null;
  selectedListId: string | null;
  setSelectedNoteForList: (noteId: string | null) => void;
  setIsAddListOpen: (isOpen: boolean) => void;
  isAddListOpen: boolean;
}) => {
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  const {
    isAddingNote,
    isLoading,
    notes,
    addNote,
    fetchNotes,
    handleUpdateNote,
    movingNoteId,
    deletingNoteId,
    moveNote,
    deleteNote,
    getRandomColor,
    isUpdatingNote,
  } = useNotes();

  const { lists, fetchLists } = useLists();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchLists();
      await fetchNotes();
    };

    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    color: z.string(),
    listId: z.string().optional(),
    _id: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      color: "",
      listId: "",
    },
  });

  const filteredNotes = useMemo(
    () =>
      notes?.filter(
        (note: Note) =>
          (selectedListId === null || note.listId === selectedListId) &&
          (!searchTerm ||
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || [],
    [notes, selectedListId, searchTerm]
  );

  const onEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditNoteOpen(true);
    form.reset({
      title: note.title,
      content: note.content,
      color: note.color,
      listId: note.listId || "no-list",
    });
  };

  const NotesSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="relative rounded-lg p-4 shadow-sm bg-white">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-20 w-full mb-2" />
          <div className="flex gap-1 mb-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <ScrollArea className="h-[calc(100vh-10rem)] ps-2 pr-4 sm:px-4">
        {isLoading ? (
          <NotesSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                No notes yet, click + to add your first note
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  handleEditNote={onEditNote}
                  deleteNote={deleteNote}
                  moveNote={(noteId, newListId) => {
                    if (note.listId !== undefined) {
                      moveNote(noteId, note.listId, newListId);
                    }
                  }}
                  lists={lists}
                  deletingNoteId={deletingNoteId}
                  movingNoteId={movingNoteId}
                  setSelectedNoteForList={setSelectedNoteForList}
                  setIsAddListOpen={setIsAddListOpen}
                />
              ))
            )}
            <Button
              onClick={() => {
                setIsAddNoteOpen(true);
                form.reset({
                  title: "",
                  content: "",
                  color: getRandomColor(),
                  listId: "",
                });
              }}
              className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent
          className="sm:max-w-[425px] rounded"
          aria-describedby="add-note-description"
        >
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <p
              id="add-note-description"
              className="text-sm text-muted-foreground"
            >
              Create a new note with a title, content, and color.
            </p>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                addNote(data, form, setIsAddNoteOpen)
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isAddingNote} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isAddingNote} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isAddingNote}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      defaultValue={field.value}
                      disabled={isAddingNote}
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
              <Button type="submit" disabled={isAddingNote}>
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog
        open={isEditNoteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNote(null);
            form.reset();
          }
          setIsEditNoteOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                if (selectedNote) {
                  await handleUpdateNote({
                    ...data,
                    _id: selectedNote._id,
                  });
                  setIsEditNoteOpen(false);
                  setSelectedNote(null);
                  fetchNotes();
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
                      <Input {...field} disabled={isUpdatingNote} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isUpdatingNote} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isUpdatingNote}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      defaultValue={field.value}
                      disabled={isUpdatingNote}
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
              <Button type="submit" disabled={isUpdatingNote}>
                {isUpdatingNote ? "Updating..." : "Update Note"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StickyWall;
