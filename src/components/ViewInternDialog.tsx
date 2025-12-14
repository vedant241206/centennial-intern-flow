import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Intern, InternshipStatus } from "@/types/intern";
import { Check, X, Calendar, Mail, Phone, User, Briefcase, Clock, FileText } from "lucide-react";

interface ViewInternDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intern: Intern;
}

const statusColors: Record<InternshipStatus, string> = {
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interviewed: "bg-purple-100 text-purple-800 border-purple-200",
  Accepted: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Ongoing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Completed: "bg-teal-100 text-teal-800 border-teal-200",
};

const ViewInternDialog = ({ open, onOpenChange, intern }: ViewInternDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{intern.intern_name}</h2>
              <Badge variant="outline" className={statusColors[intern.internship_status]}>
                {intern.internship_status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{intern.email}</span>
              </div>
              {intern.phone_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{intern.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Internship Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Internship Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  Type
                </div>
                <p className="text-sm font-medium">{intern.internship_type}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Duration
                </div>
                <p className="text-sm font-medium">{intern.duration || "-"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Applied
                </div>
                <p className="text-sm font-medium">{intern.date_applied || "-"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined
                </div>
                <p className="text-sm font-medium">{intern.joining_date || "-"}</p>
              </div>
            </div>
          </div>

          {/* Interviewer */}
          {intern.interviewer && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Interviewer
              </h3>
              <p className="text-sm">{intern.interviewer}</p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Offer Accepted</p>
                <div className="flex items-center gap-2">
                  {intern.accepted_offer_letter ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {intern.accepted_offer_letter ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Full-Time Conversion</p>
                <div className="flex items-center gap-2">
                  {intern.full_time_conversion ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {intern.full_time_conversion ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {intern.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{intern.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInternDialog;
