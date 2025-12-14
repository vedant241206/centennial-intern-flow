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
import { User as UserType } from "@/types/intern";
import { supabase } from "@/integrations/supabase/client";

const PersonSelection = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: newUserName.trim(),
          owner_id: session?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setUsers([...users, data]);
      setNewUserName("");
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: `${data.name} has been added.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) {
      toast({
        title: "No selection",
        description: "Please select users to delete",
        variant: "destructive",
      });
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', selectedForDelete);

      if (error) throw error;

      setUsers(users.filter((u) => !selectedForDelete.includes(u.id)));
      toast({
        title: "Deleted",
        description: `${selectedForDelete.length} user(s) and their records have been deleted.`,
      });
      
      setSelectedForDelete([]);
      setIsDeleteMode(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete users",
        variant: "destructive",
      });
    }
  };

  const toggleSelectForDelete = (id: string) => {
    setSelectedForDelete((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleUserClick = (user: UserType) => {
    if (isDeleteMode) {
      toggleSelectForDelete(user.id);
    } else {
      navigate(`/interns/${user.id}`, { state: { userName: user.name } });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Enter the name for the new user or department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                      id="user-name"
                      placeholder="e.g., HR Department"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add</Button>
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
                Delete User
              </Button>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Select the User
          </h2>
          <p className="text-muted-foreground">
            Choose a user to view and manage their intern records
          </p>
        </div>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No results found" : "No users added yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Click 'Add New User' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`
                  relative flex items-center gap-3 p-5 rounded-full border-2 transition-all duration-300
                  ${isDeleteMode && selectedForDelete.includes(user.id)
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.02]"
                  }
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isDeleteMode && (
                  <Checkbox
                    checked={selectedForDelete.includes(user.id)}
                    className="pointer-events-none"
                  />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete {selectedForDelete.length} user(s) and all intern records associated with them.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default PersonSelection;
