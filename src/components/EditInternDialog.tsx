import { useState, useEffect } from "react";
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

interface EditInternDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intern: Intern;
  onSave: (intern: Intern) => void;
}

const EditInternDialog = ({
  open,
  onOpenChange,
  intern,
  onSave,
}: EditInternDialogProps) => {
  const [formData, setFormData] = useState<Intern>(intern);

  useEffect(() => {
    setFormData(intern);
  }, [intern]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Intern</DialogTitle>
          <DialogDescription>
            Update the intern's information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_intern_name">Intern Name *</Label>
              <Input
                id="edit_intern_name"
                value={formData.intern_name}
                onChange={(e) =>
                  setFormData({ ...formData, intern_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_phone_number">Phone Number</Label>
              <Input
                id="edit_phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_date_applied">Date Applied</Label>
              <Input
                id="edit_date_applied"
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
              <Label htmlFor="edit_interviewer">Interviewer</Label>
              <Input
                id="edit_interviewer"
                value={formData.interviewer}
                onChange={(e) =>
                  setFormData({ ...formData, interviewer: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_joining_date">Joining Date</Label>
              <Input
                id="edit_joining_date"
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
            <Label htmlFor="edit_duration">Duration</Label>
            <Input
              id="edit_duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_accepted_offer_letter"
                checked={formData.accepted_offer_letter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, accepted_offer_letter: checked })
                }
              />
              <Label htmlFor="edit_accepted_offer_letter">
                Accepted Offer Letter
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_full_time_conversion"
                checked={formData.full_time_conversion}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, full_time_conversion: checked })
                }
              />
              <Label htmlFor="edit_full_time_conversion">
                Full-Time Conversion
              </Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit_notes">Notes / Remarks</Label>
            <Textarea
              id="edit_notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInternDialog;
