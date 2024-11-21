"use client";

import {
  ArrowRight,
  Calendar,
  Menu,
  Search,
  StickyNote,
  XIcon,
} from "lucide-react";
import { Note, colorOptions } from "@/types/notes";
import { List } from "@/types/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LogOut, Plus, Settings, Trash2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotes } from "@/hooks/use-notes";
import { useLists } from "@/hooks/use-lists";

interface SidebarProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  setSelectedListId: (listId: string | null) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setSearchTerm: (searchTerm: string) => void;
  setLists: React.Dispatch<React.SetStateAction<List[]>>;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  searchTerm: string;
  notes: Note[];
  lists: List[];
  isLoading?: boolean;
  addList: () => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  newListTitle: string;
  setNewListTitle: (title: string) => void;
  newListColor: string;
  setNewListColor: (color: string) => void;
  isAddListOpen: boolean;
  setIsAddListOpen: (open: boolean) => void;
  isAddingList: boolean;
  deletingListId: string | null;
  getRandomColor: () => string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({
  setIsAuthenticated,
  activeView,
  setActiveView,
  setSelectedListId,
  setSearchTerm,
  setUsername,
  setPassword,
  searchTerm,
  isAddListOpen,
  setIsAddListOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const { fetchNotes, notes, getRandomColor } = useNotes();
  const {
    isLoading,
    lists,
    fetchLists,
    addList,
    deleteList,
    newListTitle,
    setNewListTitle,
    newListColor,
    setNewListColor,
    isAddingList,
    deletingListId,
  } = useLists();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const [isTasksCollapsed, setIsTasksCollapsed] = useState(false);
  const [isListsCollapsed, setIsListsCollapsed] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchLists();
      await fetchNotes();
    };

    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetActiveView = (view: string, listId: string | null = null) => {
    setActiveView(view);
    setSelectedListId(listId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full border-b bg-white p-4 md:w-64 md:border-b-0 md:border-r md:min-h-screen">
        <div className="border-b pb-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 md:hidden" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex-1 space-y-6 py-4 px-2">
          {/* Tasks section skeleton */}
          <div>
            <Skeleton className="mb-2 h-4 w-16" />
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Lists section skeleton */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-grow" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-1 border-t pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`flex flex-col h-full w-full border-b bg-white p-4 md:w-64 md:border-b-0 md:border-r fixed md:relative top-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b pb-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8"
              placeholder="Search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div>
              <p
                className="mb-2 text-xs font-semibold uppercase text-gray-500 cursor-pointer flex items-center justify-between"
                onClick={() => setIsTasksCollapsed(!isTasksCollapsed)}
              >
                Tasks
                {isTasksCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </p>
              {!isTasksCollapsed && (
                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-between ${
                      activeView === "upcoming"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleSetActiveView("upcoming")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Upcoming
                      </div>
                      {/* <span className="text-xs text-gray-500">
                        {tasks?.length}
                      </span> */}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between ${
                      activeView === "today"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleSetActiveView("today")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Menu className="mr-2 h-4 w-4" />
                        Today
                      </div>
                      {/* <span className="text-xs text-gray-500">
                        {tasks?.length}
                      </span> */}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between ${
                      activeView === "calender"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleSetActiveView("calender")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calender
                      </div>
                      {/* <span className="text-xs text-gray-500">
                        {tasks?.length}
                      </span> */}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between ${
                      activeView === "sticky wall"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleSetActiveView("sticky wall")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <StickyNote className="mr-2 h-4 w-4" />
                        Sticky Wall
                      </div>
                      <span className="text-xs text-gray-500">
                        {notes?.length}
                      </span>
                    </div>
                  </Button>
                </nav>
              )}
            </div>
            <div>
              <p
                className="mb-2 text-xs font-semibold uppercase text-gray-500 flex items-center justify-between cursor-pointer"
                onClick={() => setIsListsCollapsed(!isListsCollapsed)}
              >
                <span>Lists</span>
                {isListsCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </p>
              {!isListsCollapsed && (
                <div className="space-y-1">
                  {lists?.map((list) => (
                    <div
                      key={list._id}
                      className="flex items-center justify-between"
                    >
                      <Button
                        variant="ghost"
                        className={`flex-grow justify-start ${
                          activeView === list._id
                            ? "bg-gray-100 hover:bg-gray-200"
                            : ""
                        }`}
                        onClick={() =>
                          handleSetActiveView("sticky wall", list._id)
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-4 w-4 rounded-full bg-${list.color} flex items-center justify-center shadow`}
                          >
                            <div
                              className={`h-2 w-2 rounded-full bg-${list.color}`}
                            />
                          </div>
                          <div
                            className={`mr-2 h-2 w-2 rounded-full ${list.color}`}
                          />
                          {list.title}
                        </div>
                        <span className="ml-auto text-xs">
                          {
                            notes?.filter((note) => note.listId === list._id)
                              .length
                          }
                        </span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${list.title} list`}
                            disabled={deletingListId === list._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your list and remove it from
                              all associated notes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteList(list._id)}
                              disabled={deletingListId === list._id}
                            >
                              {deletingListId === list._id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setIsAddListOpen(true);
                      setNewListColor(getRandomColor());
                    }}
                    disabled={isAddingList}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {isAddingList ? "Adding..." : "Add List"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="border-t pt-4">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled={isLoggingOut}
            onClick={async () => {
              try {
                setIsLoggingOut(true);
                await axios.post("/api/auth/logout");
                setIsAuthenticated(false);
                setUsername("");
                setPassword("");
                toast({
                  title: "Logged Out",
                  description: "You have been successfully logged out.",
                });
              } catch (_error: unknown) {
                toast({
                  title: "Error",
                  description:
                    _error instanceof Error
                      ? _error.message
                      : "Failed to log out. Please try again.",
                  variant: "destructive",
                });
              } finally {
                setIsLoggingOut(false);
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
        {/* Add List Dialog */}
        <Dialog
          open={isAddListOpen}
          onOpenChange={(open) => {
            setIsAddListOpen(open);
            if (!open) {
              setNewListTitle("");
              setNewListColor(getRandomColor());
            }
          }}
        >
          <DialogPortal>
            <DialogContent
              className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
              aria-describedby="add-list-description"
            >
              <DialogHeader>
                <DialogTitle>Add New List</DialogTitle>
                <p
                  id="add-list-description"
                  className="text-sm text-muted-foreground"
                >
                  Create a new list to organize your notes.
                </p>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await addList();
                  setIsAddListOpen(false);
                }}
                className="space-y-4"
              >
                <Input
                  placeholder="List title"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  required
                />
                <Select
                  value={newListColor}
                  onValueChange={(value) => setNewListColor(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isAddingList}>
                  {isAddingList ? "Adding..." : "Add List"}
                </Button>
              </form>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
