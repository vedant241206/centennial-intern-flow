import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Download,
  Upload,
  Search,
  ArrowLeft,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Header from "@/components/Header";
import AddInternDialog from "@/components/AddInternDialog";
import EditInternDialog from "@/components/EditInternDialog";
import ViewInternDialog from "@/components/ViewInternDialog";
import ImportDialog from "@/components/ImportDialog";
import { Intern, InternshipStatus, InternshipType } from "@/types/intern";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<InternshipStatus, string> = {
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interviewed: "bg-purple-100 text-purple-800 border-purple-200",
  Accepted: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Ongoing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Completed: "bg-teal-100 text-teal-800 border-teal-200",
};

const allColumns = [
  { key: "sr_no", label: "Sr No." },
  { key: "intern_name", label: "Intern Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone" },
  { key: "internship_status", label: "Status", filterable: true },
  { key: "date_applied", label: "Date Applied" },
  { key: "interviewer", label: "Interviewer", filterable: true },
  { key: "internship_type", label: "Type", filterable: true },
  { key: "joining_date", label: "Joining Date" },
  { key: "duration", label: "Duration", filterable: true },
  { key: "accepted_offer_letter", label: "Offer Accepted", filterable: true },
  { key: "full_time_conversion", label: "Full-Time", filterable: true },
  { key: "notes", label: "Notes" },
];

const InternDashboard = () => {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();
  const location = useLocation();
  const userName = location.state?.userName || "Unknown";

  const [interns, setInterns] = useState<Intern[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [internToDelete, setInternToDelete] = useState<Intern | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session && personId) {
      fetchInterns();
    }
  }, [session, personId]);

  const fetchInterns = async () => {
    try {
      const { data, error } = await supabase
        .from('interns')
        .select('*')
        .eq('user_id', personId)
        .order('sr_no', { ascending: true });

      if (error) throw error;
      
      const mappedData = (data || []).map(intern => ({
        ...intern,
        internship_status: intern.internship_status as InternshipStatus,
        internship_type: intern.internship_type as InternshipType,
        date_applied: intern.date_applied || '',
        joining_date: intern.joining_date || '',
      }));
      
      setInterns(mappedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch interns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch =
        intern.intern_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.phone_number.includes(searchQuery);
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const internValue = intern[key as keyof Intern];
        if (typeof internValue === 'boolean') {
          return value === 'Yes' ? internValue : !internValue;
        }
        return String(internValue).toLowerCase().includes(value.toLowerCase());
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [interns, searchQuery, filters]);

  const getUniqueValues = (key: string) => {
    const values = interns.map((intern) => {
      const value = intern[key as keyof Intern];
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return String(value || '');
    });
    return [...new Set(values)].filter(Boolean);
  };

  const handleAddIntern = async (newIntern: Omit<Intern, "id" | "sr_no" | "created_at" | "updated_at">) => {
    try {
      const maxSrNo = interns.length > 0 ? Math.max(...interns.map(i => i.sr_no)) : 0;
      
      const { data, error } = await supabase
        .from('interns')
        .insert({
          ...newIntern,
          sr_no: maxSrNo + 1,
          user_id: personId,
          owner_id: session?.user?.id,
          date_applied: newIntern.date_applied || null,
          joining_date: newIntern.joining_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        ...data,
        internship_status: data.internship_status as InternshipStatus,
        internship_type: data.internship_type as InternshipType,
        date_applied: data.date_applied || '',
        joining_date: data.joining_date || '',
      };

      setInterns([...interns, mappedData]);
      setIsAddDialogOpen(false);
      toast({
        title: "Intern Added",
        description: `${data.intern_name} has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add intern",
        variant: "destructive",
      });
    }
  };

  const handleEditIntern = async (updatedIntern: Intern) => {
    try {
      const { error } = await supabase
        .from('interns')
        .update({
          intern_name: updatedIntern.intern_name,
          email: updatedIntern.email,
          phone_number: updatedIntern.phone_number,
          internship_status: updatedIntern.internship_status,
          date_applied: updatedIntern.date_applied || null,
          interviewer: updatedIntern.interviewer,
          internship_type: updatedIntern.internship_type,
          joining_date: updatedIntern.joining_date || null,
          duration: updatedIntern.duration,
          accepted_offer_letter: updatedIntern.accepted_offer_letter,
          notes: updatedIntern.notes,
          full_time_conversion: updatedIntern.full_time_conversion,
        })
        .eq('id', updatedIntern.id);

      if (error) throw error;

      setInterns(interns.map((i) =>
        i.id === updatedIntern.id ? updatedIntern : i
      ));
      setIsEditDialogOpen(false);
      setSelectedIntern(null);
      toast({
        title: "Intern Updated",
        description: `${updatedIntern.intern_name}'s record has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update intern",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntern = (intern: Intern) => {
    setInternToDelete(intern);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteIntern = async () => {
    if (!internToDelete) return;
    
    try {
      const { error } = await supabase
        .from('interns')
        .delete()
        .eq('id', internToDelete.id);

      if (error) throw error;

      const updatedInterns = interns
        .filter((i) => i.id !== internToDelete.id)
        .map((intern, index) => ({ ...intern, sr_no: index + 1 }));
      
      setInterns(updatedInterns);
      toast({
        title: "Intern Deleted",
        description: `${internToDelete.intern_name} has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete intern",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setInternToDelete(null);
    }
  };

  const handleCellClick = (intern: Intern, key: string) => {
    if (key === 'sr_no') return;
    setEditingCell({ id: intern.id, key });
    const value = intern[key as keyof Intern];
    if (typeof value === 'boolean') {
      setEditingValue(value ? 'Yes' : 'No');
    } else {
      setEditingValue(String(value || ''));
    }
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;
    
    const intern = interns.find(i => i.id === editingCell.id);
    if (!intern) return;

    let newValue: any = editingValue;
    if (editingCell.key === 'accepted_offer_letter' || editingCell.key === 'full_time_conversion') {
      newValue = editingValue.toLowerCase() === 'yes';
    }

    const updatedIntern = { ...intern, [editingCell.key]: newValue };
    
    try {
      const { error } = await supabase
        .from('interns')
        .update({ [editingCell.key]: newValue })
        .eq('id', editingCell.id);

      if (error) throw error;

      setInterns(interns.map(i => i.id === editingCell.id ? updatedIntern : i));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
    
    setEditingCell(null);
    setEditingValue("");
  };

  const handleExport = () => {
    const headers = allColumns.map((col) => col.label).join(",");
    const rows = interns.map((intern) =>
      allColumns
        .map((col) => {
          const value = intern[col.key as keyof Intern];
          if (typeof value === "boolean") return value ? "Yes" : "No";
          if (value === undefined || value === null) return "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interns_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Intern data has been downloaded as CSV.",
    });
  };

  const handleImport = async (importedInterns: Partial<Intern>[]) => {
    const maxSrNo = interns.length > 0 ? Math.max(...interns.map(i => i.sr_no)) : 0;
    
    const newInterns = importedInterns.map((data, index) => ({
      sr_no: maxSrNo + index + 1,
      intern_name: data.intern_name || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      internship_status: data.internship_status || "Applied",
      date_applied: data.date_applied || null,
      interviewer: data.interviewer || "",
      internship_type: data.internship_type || "Remote",
      joining_date: data.joining_date || null,
      duration: data.duration || "",
      accepted_offer_letter: data.accepted_offer_letter || false,
      notes: data.notes || "",
      full_time_conversion: data.full_time_conversion || false,
      user_id: personId,
      owner_id: session?.user?.id,
    }));

    try {
      const { data, error } = await supabase
        .from('interns')
        .insert(newInterns)
        .select();

      if (error) throw error;

      const mappedData = (data || []).map(intern => ({
        ...intern,
        internship_status: intern.internship_status as InternshipStatus,
        internship_type: intern.internship_type as InternshipType,
        date_applied: intern.date_applied || '',
        joining_date: intern.joining_date || '',
      }));

      setInterns([...interns, ...mappedData]);
      setIsImportDialogOpen(false);
      toast({
        title: "Import Complete",
        description: `${data.length} intern(s) have been imported.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import interns",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const renderCell = (intern: Intern, columnKey: string) => {
    const value = intern[columnKey as keyof Intern];
    const isEditing = editingCell?.id === intern.id && editingCell?.key === columnKey;

    if (isEditing) {
      return (
        <Input
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={handleCellBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleCellBlur()}
          autoFocus
          className="h-8 w-full min-w-[100px]"
        />
      );
    }

    switch (columnKey) {
      case "internship_status":
        return (
          <Badge variant="outline" className={statusColors[value as InternshipStatus]}>
            {value}
          </Badge>
        );
      case "accepted_offer_letter":
      case "full_time_conversion":
        return value ? "Yes" : "No";
      case "notes":
        return (
          <span className="max-w-[200px] truncate block" title={value as string}>
            {value || "-"}
          </span>
        );
      default:
        return value || "-";
    }
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

      <main className="container px-4 py-6 md:py-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/users")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {userName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {interns.length} intern{interns.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Intern
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>

          <div className="relative flex-1 lg:w-64 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interns..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {allColumns.map((column) => (
                    <TableHead key={column.key} className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.filterable && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Filter className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>Filter by {column.label}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setFilters(prev => ({ ...prev, [column.key]: '' }))}
                              >
                                All
                              </DropdownMenuItem>
                              {getUniqueValues(column.key).map((value) => (
                                <DropdownMenuItem 
                                  key={value}
                                  onClick={() => setFilters(prev => ({ ...prev, [column.key]: value }))}
                                >
                                  {value}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length + 1}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {searchQuery || Object.values(filters).some(Boolean)
                        ? "No interns match your filters"
                        : "No interns added yet. Click 'Add Intern' to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterns.map((intern) => (
                    <TableRow key={intern.id} className="hover:bg-muted/50">
                      {allColumns.map((column) => (
                        <TableCell 
                          key={column.key} 
                          className="whitespace-nowrap cursor-pointer"
                          onClick={() => handleCellClick(intern, column.key)}
                        >
                          {renderCell(intern, column.key)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedIntern(intern);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedIntern(intern);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteIntern(intern)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Showing {filteredInterns.length} of {interns.length} interns
          </span>
          {interns.length > 0 && (
            <>
              <span>•</span>
              <span>
                {interns.filter((i) => i.internship_status === "Ongoing").length} ongoing
              </span>
              <span>•</span>
              <span>
                {interns.filter((i) => i.full_time_conversion).length} converted to full-time
              </span>
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {internToDelete?.intern_name}'s record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteIntern}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      <AddInternDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddIntern}
      />

      {selectedIntern && (
        <>
          <EditInternDialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setSelectedIntern(null);
            }}
            intern={selectedIntern}
            onSave={handleEditIntern}
          />
          <ViewInternDialog
            open={isViewDialogOpen}
            onOpenChange={(open) => {
              setIsViewDialogOpen(open);
              if (!open) setSelectedIntern(null);
            }}
            intern={selectedIntern}
          />
        </>
      )}

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
      />
    </div>
  );
};

export default InternDashboard;
