import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Intern, InternshipStatus, InternshipType } from "@/types/intern";
import { Star } from "lucide-react";

interface AddInternDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (intern: Omit<Intern, "id" | "sr_no" | "created_at" | "updated_at">) => void;
}

const AddInternDialog = ({ open, onOpenChange, onAdd }: AddInternDialogProps) => {
  const [formData, setFormData] = useState({
    intern_name: "",
    email: "",
    phone_number: "",
    internship_status: "Applied" as InternshipStatus,
    date_applied: new Date().toISOString().split("T")[0],
    interviewer: "",
    internship_type: "Remote" as InternshipType,
    joining_date: "",
    duration: "",
    accepted_offer_letter: false,
    notes: "",
    performance_rating: 0,
    full_time_conversion: false,
    person_id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.intern_name || !formData.email) {
      return;
    }
    onAdd(formData);
    // Reset form
    setFormData({
      intern_name: "",
      email: "",
      phone_number: "",
      internship_status: "Applied",
      date_applied: new Date().toISOString().split("T")[0],
      interviewer: "",
      internship_type: "Remote",
      joining_date: "",
      duration: "",
      accepted_offer_letter: false,
      notes: "",
      performance_rating: 0,
      full_time_conversion: false,
      person_id: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Intern</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new intern record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intern_name">Intern Name *</Label>
              <Input
                id="intern_name"
                value={formData.intern_name}
                onChange={(e) =>
                  setFormData({ ...formData, intern_name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="+1 555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_applied">Date Applied</Label>
              <Input
                id="date_applied"
                type="date"
                value={formData.date_applied}
                onChange={(e) =>
                  setFormData({ ...formData, date_applied: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Internship Status</Label>
              <Select
                value={formData.internship_status}
                onValueChange={(value: InternshipStatus) =>
                  setFormData({ ...formData, internship_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewed">Interviewed</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internship Type</Label>
              <Select
                value={formData.internship_type}
                onValueChange={(value: InternshipType) =>
                  setFormData({ ...formData, internship_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interviewer and Joining */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                value={formData.interviewer}
                onChange={(e) =>
                  setFormData({ ...formData, interviewer: e.target.value })
                }
                placeholder="Interviewer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joining_date">Joining Date</Label>
              <Input
                id="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={(e) =>
                  setFormData({ ...formData, joining_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              placeholder="e.g., 3 months, 6 months"
            />
          </div>

          {/* Performance Rating */}
          <div className="space-y-2">
            <Label>Performance Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, performance_rating: star })
                  }
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= formData.performance_rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {formData.performance_rating > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, performance_rating: 0 })
                  }
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="accepted_offer_letter"
                checked={formData.accepted_offer_letter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, accepted_offer_letter: checked })
                }
              />
              <Label htmlFor="accepted_offer_letter">Accepted Offer Letter</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="full_time_conversion"
                checked={formData.full_time_conversion}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, full_time_conversion: checked })
                }
              />
              <Label htmlFor="full_time_conversion">Full-Time Conversion</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Remarks</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Intern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInternDialog;
