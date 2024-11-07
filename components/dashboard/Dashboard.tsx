import React, { useState, useEffect, useMemo } from "react";
import { Menu } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sidebar } from "@/components/sidebar/Sidebar";

import { Note, colorOptions } from "@/types/notes";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/use-notes";
import NoteCard from "./note-card/NoteCard";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  color: z.string(),
  listId: z.string().optional(),
  _id: z.string().optional(),
});

const Dashboard = ({
  setIsAuthenticated,
  setUsername,
  setPassword,
}: {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("sticky-wall");
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [pendingNoteUpdate, setPendingNoteUpdate] = useState<{
    noteId: string;
    newListId: string | null;
  } | null>(null);

  const [isAddListOpen, setIsAddListOpen] = useState(false);

  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);

  const [selectedNoteForList, setSelectedNoteForList] = useState<string | null>(
    null
  );

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      color: "",
      listId: "",
    },
  });

  const {
    isAddingNote,
    isLoading,
    notes,
    lists,
    setNotes,
    setLists,
    addNote,
    fetchLists,
    fetchNotes,
    handleUpdateNote,
    movingNoteId,
    deletingNoteId,
    moveNote,
    deleteNote,
    addList,
    deleteList,
    newListTitle,
    setNewListTitle,
    newListColor,
    setNewListColor,
    isAddingList,
    deletingListId,
    getRandomColor,
    isUpdatingNote,
  } = useNotes();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchNotes();
      await fetchLists();
    };

    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingNoteUpdate) {
      setNotes((prev) =>
        prev.map((note) =>
          note._id === pendingNoteUpdate.noteId
            ? { ...note, listId: pendingNoteUpdate.newListId }
            : note
        )
      );
      setPendingNoteUpdate(null);
    }
  }, [pendingNoteUpdate, setNotes]);

  const filteredNotes = useMemo(
    () =>
      notes?.filter(
        (note: Note) =>
          (selectedListId === null || note.listId === selectedListId) &&
          (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || [],
    [notes, selectedListId, searchTerm]
  );

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

  const renderContent = () => {
    switch (activeView) {
      case "sticky-wall":
        return (
          <ScrollArea className="h-[calc(100vh-10rem)] px-4">
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
        );
      case "pages":
        return (
          <div className="p-4">
            <h2 className="mb-4 text-xl font-semibold">Pages</h2>
            <p>This is where you can manage your pages.</p>
          </div>
        );
      case "functions":
        return (
          <div className="p-4">
            <h2 className="mb-4 text-xl font-semibold">Functions</h2>
            <p>This is where you can manage your functions.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="flex h-[calc(100vh-2rem)] flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar
            setIsAuthenticated={setIsAuthenticated}
            setActiveView={setActiveView}
            setSelectedListId={setSelectedListId}
            setNotes={setNotes}
            setLists={setLists}
            searchTerm={searchTerm}
            setUsername={setUsername}
            setPassword={setPassword}
            lists={lists}
            notes={notes}
            setSearchTerm={setSearchTerm}
            isLoading={isLoading}
            addList={addList}
            deleteList={deleteList}
            newListTitle={newListTitle}
            setNewListTitle={setNewListTitle}
            newListColor={newListColor}
            setNewListColor={setNewListColor}
            isAddListOpen={isAddListOpen}
            setIsAddListOpen={setIsAddListOpen}
            isAddingList={isAddingList}
            deletingListId={deletingListId}
            getRandomColor={getRandomColor}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Content */}
          <div className="flex-1 bg-gray-50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h1 className="mb-6 text-2xl font-bold">
                  {activeView === "sticky-wall" && selectedListId
                    ? lists?.find((list) => list._id === selectedListId)
                        ?.title || "Sticky Wall"
                    : "All Notes"}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mb-6"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

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

      {/* Add List Dialog */}
      <Dialog open={isAddListOpen} onOpenChange={setIsAddListOpen}>
        <DialogContent className="sm:max-w-[425px] rounded">
          <DialogHeader>
            <DialogTitle>Add List to Note</DialogTitle>
          </DialogHeader>
          <Select
            onValueChange={(listId) => {
              const note = notes.find((n) => n._id === selectedNoteForList);
              if (selectedNoteForList) {
                setPendingNoteUpdate({
                  noteId: selectedNoteForList,
                  newListId: listId,
                });
                moveNote(selectedNoteForList, note?.listId || null, listId);
              }
              setIsAddListOpen(false);
            }}
            disabled={movingNoteId === selectedNoteForList}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists?.map((list) => (
                <SelectItem key={list._id} value={list._id}>
                  {list.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
