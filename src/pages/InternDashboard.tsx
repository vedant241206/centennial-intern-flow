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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Download,
  Upload,
  Search,
  ArrowLeft,
  Filter,
  Columns3,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Check,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import AddInternDialog from "@/components/AddInternDialog";
import EditInternDialog from "@/components/EditInternDialog";
import ViewInternDialog from "@/components/ViewInternDialog";
import ImportDialog from "@/components/ImportDialog";
import { Intern, InternshipStatus, InternshipType } from "@/types/intern";

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
  { key: "internship_status", label: "Status" },
  { key: "date_applied", label: "Date Applied" },
  { key: "interviewer", label: "Interviewer" },
  { key: "internship_type", label: "Type" },
  { key: "joining_date", label: "Joining Date" },
  { key: "duration", label: "Duration" },
  { key: "accepted_offer_letter", label: "Offer Accepted" },
  { key: "performance_rating", label: "Rating" },
  { key: "full_time_conversion", label: "Full-Time" },
  { key: "notes", label: "Notes" },
];

const InternDashboard = () => {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();
  const location = useLocation();
  const personName = location.state?.personName || "Unknown";

  const [interns, setInterns] = useState<Intern[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "sr_no",
    "intern_name",
    "email",
    "phone_number",
    "internship_status",
    "internship_type",
    "joining_date",
    "performance_rating",
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Load interns for this person
    const savedInterns = localStorage.getItem(`interns_${personId}`);
    if (savedInterns) {
      setInterns(JSON.parse(savedInterns));
    } else {
      // Demo data
      const demoInterns: Intern[] = [
        {
          id: "1",
          sr_no: 1,
          intern_name: "John Smith",
          email: "john.smith@email.com",
          phone_number: "+1 555-0101",
          internship_status: "Ongoing",
          date_applied: "2024-01-15",
          interviewer: "Sarah Johnson",
          internship_type: "Remote",
          joining_date: "2024-02-01",
          duration: "6 months",
          accepted_offer_letter: true,
          notes: "Excellent communication skills",
          performance_rating: 4,
          full_time_conversion: false,
          person_id: personId || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          sr_no: 2,
          intern_name: "Emily Davis",
          email: "emily.davis@email.com",
          phone_number: "+1 555-0102",
          internship_status: "Completed",
          date_applied: "2023-11-20",
          interviewer: "Michael Brown",
          internship_type: "Onsite",
          joining_date: "2023-12-01",
          duration: "3 months",
          accepted_offer_letter: true,
          notes: "Outstanding performance, recommended for full-time",
          performance_rating: 5,
          full_time_conversion: true,
          person_id: personId || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          sr_no: 3,
          intern_name: "Alex Chen",
          email: "alex.chen@email.com",
          phone_number: "+1 555-0103",
          internship_status: "Applied",
          date_applied: "2024-03-01",
          interviewer: "",
          internship_type: "Hybrid",
          joining_date: "",
          duration: "",
          accepted_offer_letter: false,
          notes: "Strong technical background",
          performance_rating: 0,
          full_time_conversion: false,
          person_id: personId || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setInterns(demoInterns);
      localStorage.setItem(`interns_${personId}`, JSON.stringify(demoInterns));
    }
  }, [navigate, personId]);

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch =
        intern.intern_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.phone_number.includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || intern.internship_status === statusFilter;
      const matchesType =
        typeFilter === "all" || intern.internship_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [interns, searchQuery, statusFilter, typeFilter]);

  const handleAddIntern = (newIntern: Omit<Intern, "id" | "sr_no" | "created_at" | "updated_at">) => {
    const intern: Intern = {
      ...newIntern,
      id: Date.now().toString(),
      sr_no: interns.length + 1,
      person_id: personId || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedInterns = [...interns, intern];
    setInterns(updatedInterns);
    localStorage.setItem(`interns_${personId}`, JSON.stringify(updatedInterns));
    setIsAddDialogOpen(false);
    toast({
      title: "Intern Added",
      description: `${intern.intern_name} has been added successfully.`,
    });
  };

  const handleEditIntern = (updatedIntern: Intern) => {
    const updatedInterns = interns.map((i) =>
      i.id === updatedIntern.id
        ? { ...updatedIntern, updated_at: new Date().toISOString() }
        : i
    );
    setInterns(updatedInterns);
    localStorage.setItem(`interns_${personId}`, JSON.stringify(updatedInterns));
    setIsEditDialogOpen(false);
    setSelectedIntern(null);
    toast({
      title: "Intern Updated",
      description: `${updatedIntern.intern_name}'s record has been updated.`,
    });
  };

  const handleDeleteIntern = (id: string) => {
    const intern = interns.find((i) => i.id === id);
    const updatedInterns = interns.filter((i) => i.id !== id);
    // Recalculate sr_no
    const reindexed = updatedInterns.map((intern, index) => ({
      ...intern,
      sr_no: index + 1,
    }));
    setInterns(reindexed);
    localStorage.setItem(`interns_${personId}`, JSON.stringify(reindexed));
    toast({
      title: "Intern Deleted",
      description: `${intern?.intern_name} has been removed.`,
    });
  };

  const handleExport = () => {
    // Create CSV content
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

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interns_${personName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Intern data has been downloaded as CSV.",
    });
  };

  const handleImport = (importedInterns: Partial<Intern>[]) => {
    const newInterns: Intern[] = importedInterns.map((data, index) => ({
      id: Date.now().toString() + index,
      sr_no: interns.length + index + 1,
      intern_name: data.intern_name || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      internship_status: (data.internship_status as InternshipStatus) || "Applied",
      date_applied: data.date_applied || new Date().toISOString().split("T")[0],
      interviewer: data.interviewer || "",
      internship_type: (data.internship_type as InternshipType) || "Remote",
      joining_date: data.joining_date || "",
      duration: data.duration || "",
      accepted_offer_letter: data.accepted_offer_letter || false,
      notes: data.notes || "",
      performance_rating: data.performance_rating || 0,
      full_time_conversion: data.full_time_conversion || false,
      person_id: personId || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const updatedInterns = [...interns, ...newInterns];
    setInterns(updatedInterns);
    localStorage.setItem(`interns_${personId}`, JSON.stringify(updatedInterns));
    setIsImportDialogOpen(false);
    toast({
      title: "Import Complete",
      description: `${newInterns.length} intern(s) have been imported.`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    navigate("/auth");
  };

  const renderCell = (intern: Intern, columnKey: string) => {
    const value = intern[columnKey as keyof Intern];

    switch (columnKey) {
      case "internship_status":
        return (
          <Badge variant="outline" className={statusColors[value as InternshipStatus]}>
            {value}
          </Badge>
        );
      case "accepted_offer_letter":
      case "full_time_conversion":
        return value ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground" />
        );
      case "performance_rating":
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= (value as number)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        );
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

  return (
    <div className="min-h-screen bg-background">
      <Header showLogout onLogout={handleLogout} />

      <main className="container px-4 py-6 md:py-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/persons")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {personName}
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

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interns..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interviewed">Interviewed</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Columns3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns.includes(column.key)}
                    onCheckedChange={(checked) => {
                      setVisibleColumns(
                        checked
                          ? [...visibleColumns, column.key]
                          : visibleColumns.filter((c) => c !== column.key)
                      );
                    }}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <TableHead key={column.key} className="whitespace-nowrap">
                        {column.label}
                      </TableHead>
                    ))}
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length + 1}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                        ? "No interns match your filters"
                        : "No interns added yet. Click 'Add Intern' to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterns.map((intern) => (
                    <TableRow key={intern.id} className="hover:bg-muted/50">
                      {allColumns
                        .filter((col) => visibleColumns.includes(col.key))
                        .map((column) => (
                          <TableCell key={column.key} className="whitespace-nowrap">
                            {renderCell(intern, column.key)}
                          </TableCell>
                        ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              className="gap-2"
                              onClick={() => {
                                setSelectedIntern(intern);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              className="gap-2"
                              onClick={() => {
                                setSelectedIntern(intern);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleDeleteIntern(intern.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuCheckboxItem>
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
