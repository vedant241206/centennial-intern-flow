import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Intern } from "@/types/intern";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (interns: Partial<Intern>[]) => void;
}

const ImportDialog = ({ open, onOpenChange, onImport }: ImportDialogProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Partial<Intern>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Partial<Intern>[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file must have a header row and at least one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const data: Partial<Intern>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        if (values[index]) {
          // Map common CSV headers to our field names
          const fieldMap: Record<string, string> = {
            name: "intern_name",
            "intern name": "intern_name",
            "full name": "intern_name",
            email: "email",
            phone: "phone_number",
            "phone number": "phone_number",
            status: "internship_status",
            type: "internship_type",
            "date applied": "date_applied",
            interviewer: "interviewer",
            "joining date": "joining_date",
            duration: "duration",
            notes: "notes",
            rating: "performance_rating",
          };

          const fieldName = fieldMap[header] || header;
          let value: unknown = values[index];

          // Convert boolean fields
          if (fieldName === "accepted_offer_letter" || fieldName === "full_time_conversion") {
            const strValue = String(value).toLowerCase();
            value = strValue === "yes" || strValue === "true";
          }

          // Convert rating to number
          if (fieldName === "performance_rating") {
            value = parseInt(value as string) || 0;
          }

          row[fieldName] = value;
        }
      });

      if (row.intern_name || row.email) {
        data.push(row as Partial<Intern>);
      }
    }

    return data;
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setPreviewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
        setPreviewData([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      handleFile(droppedFile);
    } else {
      setError("Please upload a CSV file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (previewData.length > 0) {
      onImport(previewData);
      setFile(null);
      setPreviewData([]);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Interns</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import intern records. The file should have columns
            like Name, Email, Phone, Status, Type, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Drag and drop a CSV file here, or click to browse
            </p>
          </div>

          {/* File info */}
          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {previewData.length} record(s) found
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-3 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Preview (first 3 records):</h4>
              <div className="space-y-2 text-sm">
                {previewData.slice(0, 3).map((intern, index) => (
                  <div key={index} className="p-2 bg-muted/30 rounded">
                    <span className="font-medium">{intern.intern_name}</span>
                    {intern.email && <span className="text-muted-foreground"> - {intern.email}</span>}
                  </div>
                ))}
                {previewData.length > 3 && (
                  <p className="text-muted-foreground">
                    ... and {previewData.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sample format */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              Expected CSV format:
            </h4>
            <code className="text-xs text-muted-foreground">
              Name,Email,Phone,Status,Type,Joining Date,Duration
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={previewData.length === 0}>
            Import {previewData.length > 0 && `(${previewData.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
