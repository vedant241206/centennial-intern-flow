import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, User } from "lucide-react";
import Header from "@/components/Header";
import { Person } from "@/types/intern";

const PersonSelection = () => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Load persons from localStorage (will be replaced with Supabase)
    const savedPersons = localStorage.getItem("persons");
    if (savedPersons) {
      setPersons(JSON.parse(savedPersons));
    } else {
      // Add some demo data
      const demoPersons: Person[] = [
        { id: "1", name: "HR Department", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "demo" },
        { id: "2", name: "Engineering Team", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "demo" },
        { id: "3", name: "Marketing Division", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "demo" },
      ];
      setPersons(demoPersons);
      localStorage.setItem("persons", JSON.stringify(demoPersons));
    }
  }, [navigate]);

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo",
    };

    const updatedPersons = [...persons, newPerson];
    setPersons(updatedPersons);
    localStorage.setItem("persons", JSON.stringify(updatedPersons));
    setNewPersonName("");
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: `${newPerson.name} has been added.`,
    });
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) {
      toast({
        title: "No selection",
        description: "Please select persons to delete",
        variant: "destructive",
      });
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updatedPersons = persons.filter((p) => !selectedForDelete.includes(p.id));
    setPersons(updatedPersons);
    localStorage.setItem("persons", JSON.stringify(updatedPersons));
    
    // Also delete associated interns
    selectedForDelete.forEach((personId) => {
      localStorage.removeItem(`interns_${personId}`);
    });

    toast({
      title: "Deleted",
      description: `${selectedForDelete.length} person(s) and their records have been deleted.`,
    });
    
    setSelectedForDelete([]);
    setIsDeleteMode(false);
    setShowDeleteConfirm(false);
  };

  const toggleSelectForDelete = (id: string) => {
    setSelectedForDelete((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePersonClick = (person: Person) => {
    if (isDeleteMode) {
      toggleSelectForDelete(person.id);
    } else {
      navigate(`/interns/${person.id}`, { state: { personName: person.name } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showLogout onLogout={handleLogout} />
      
      <main className="container px-4 py-8 md:py-12">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Person
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Person</DialogTitle>
                  <DialogDescription>
                    Enter the name for the new person or department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="person-name">Name</Label>
                    <Input
                      id="person-name"
                      placeholder="e.g., HR Department"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPerson()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPerson}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isDeleteMode ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDeleteSelected}
                  disabled={selectedForDelete.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedForDelete.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedForDelete([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsDeleteMode(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Person
              </Button>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search persons..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Select the Person or User
          </h2>
          <p className="text-muted-foreground">
            Choose a person to view and manage their intern records
          </p>
        </div>

        {/* Person List */}
        {filteredPersons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No results found" : "No persons added yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Click 'Add New Person' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPersons.map((person, index) => (
              <button
                key={person.id}
                onClick={() => handlePersonClick(person)}
                className={`
                  relative flex items-center gap-3 p-5 rounded-full border-2 transition-all duration-300
                  ${isDeleteMode && selectedForDelete.includes(person.id)
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.02]"
                  }
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isDeleteMode && (
                  <Checkbox
                    checked={selectedForDelete.includes(person.id)}
                    className="pointer-events-none"
                  />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium truncate">{person.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedForDelete.length} person(s)?
                This will also delete all intern records associated with them.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default PersonSelection;
