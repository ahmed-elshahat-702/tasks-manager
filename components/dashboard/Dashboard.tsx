import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useNotes } from "@/hooks/use-notes";
import Upcoming from "./upcoming/Upcoming";
import StickyWall from "./sticky-wall/StickyWall";
import Calender from "./calender/Calender";
import Today from "./today/Today";
import { useLists } from "@/hooks/use-lists";

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
  const [activeView, setActiveView] = useState("upcoming");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [pendingNoteUpdate, setPendingNoteUpdate] = useState<{
    noteId: string;
    newListId: string | null;
  } | null>(null);

  const [isAddListOpen, setIsAddListOpen] = useState(false);

  const [selectedNoteForList, setSelectedNoteForList] = useState<string | null>(
    null
  );

  const { notes, setNotes, getRandomColor } = useNotes();
  const {
    lists,
    setLists,
    addList,
    deleteList,
    newListTitle,
    setNewListTitle,
    newListColor,
    setNewListColor,
    isAddingList,
    deletingListId,
  } = useLists();

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

  const renderContent = () => {
    switch (activeView) {
      case "sticky wall":
        return (
          <StickyWall
            setPendingNoteUpdate={setPendingNoteUpdate}
            selectedNoteForList={selectedNoteForList}
            searchTerm={searchTerm}
            selectedListId={selectedListId}
            setSelectedNoteForList={setSelectedNoteForList}
            setIsAddListOpen={setIsAddListOpen}
            isAddListOpen={isAddListOpen}
          />
        );
      case "upcoming":
        return <Upcoming />;
      case "today":
        return <Today />;
      case "calender":
        return <Calender />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 sm:p-4">
      <div className="mx-auto max-w-6xl max-sm:h-full overflow-hidden sm:rounded-xl bg-white shadow-lg">
        <div className="flex h-[calc(100vh-2rem)] flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar
            setIsAuthenticated={setIsAuthenticated}
            activeView={activeView}
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
          <div className="flex-1 bg-gray-50 p-2 sm:p-6">
            <div className="flex items-center justify-between max-sm:p-2">
              <h1 className="mb-6 text-2xl font-bold capitalize">
                {activeView}
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
  );
};

export default Dashboard;
