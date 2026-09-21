export type Database = {
  public: {
    Tables: {
      tutors: {
        Row: { id: string; name: string; email: string };
        Insert: { id: string; name: string; email: string };
        Update: { id?: string; name?: string; email?: string };
        Relationships: [];
      };
      students: {
        Row: { id: string; name: string; tutoring_site: string; status: "active" | "stopped" };
        Insert: { id: string; name: string; tutoring_site: string; status: "active" | "stopped" };
        Update: { id?: string; name?: string; tutoring_site?: string; status?: "active" | "stopped" };
        Relationships: [];
      };
      assignments: {
        Row: { id: string; tutor_id: string; student_id: string; term_label: string; start_date: string; end_date: string | null };
        Insert: { id: string; tutor_id: string; student_id: string; term_label: string; start_date: string; end_date?: string | null };
        Update: { id?: string; tutor_id?: string; student_id?: string; term_label?: string; start_date?: string; end_date?: string | null };
        Relationships: [
          { foreignKeyName: "assignments_tutor_id_fkey"; columns: ["tutor_id"]; isOneToOne: false; referencedRelation: "tutors"; referencedColumns: ["id"] },
          { foreignKeyName: "assignments_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] },
        ];
      };
      sessions: {
        Row: { id: string; assignment_id: string; session_date: string; duration_minutes: number; notes: string | null; created_at: string };
        Insert: { id: string; assignment_id: string; session_date: string; duration_minutes: number; notes?: string | null; created_at?: string };
        Update: { id?: string; assignment_id?: string; session_date?: string; duration_minutes?: number; notes?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "sessions_assignment_id_fkey"; columns: ["assignment_id"]; isOneToOne: false; referencedRelation: "assignments"; referencedColumns: ["id"] },
        ];
      };
      goals: {
        Row: { id: string; student_id: string; title: string; category: "economic" | "educational" | "family" | "community" | "other"; status: "in_progress" | "completed"; created_at: string; completed_at: string | null };
        Insert: { id: string; student_id: string; title: string; category: "economic" | "educational" | "family" | "community" | "other"; status: "in_progress" | "completed"; created_at?: string; completed_at?: string | null };
        Update: { id?: string; student_id?: string; title?: string; category?: "economic" | "educational" | "family" | "community" | "other"; status?: "in_progress" | "completed"; created_at?: string; completed_at?: string | null };
        Relationships: [
          { foreignKeyName: "goals_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
