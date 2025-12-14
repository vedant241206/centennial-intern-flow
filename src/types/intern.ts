export type InternshipStatus = 
  | 'Applied' 
  | 'Interviewed' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Ongoing' 
  | 'Completed';

export type InternshipType = 
  | 'Remote' 
  | 'Onsite' 
  | 'Hybrid' 
  | 'Paid' 
  | 'Unpaid';

export interface Intern {
  id: string;
  sr_no: number;
  intern_name: string;
  email: string;
  phone_number: string;
  internship_status: InternshipStatus;
  date_applied: string;
  interviewer: string;
  internship_type: InternshipType;
  joining_date: string;
  duration: string;
  accepted_offer_letter: boolean;
  resume_url?: string;
  offer_letter_url?: string;
  notes: string;
  performance_rating: number;
  full_time_conversion: boolean;
  person_id: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CustomField {
  id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file';
  is_required: boolean;
  dropdown_options?: string[];
  field_order: number;
  person_id: string;
}
