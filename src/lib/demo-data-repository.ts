import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { DemoData, Goal, GoalStatus, TutoringSession } from "@/lib/types";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];

export interface DemoDataRepository {
  load(): Promise<DemoData>;
  addSession(session: TutoringSession): Promise<TutoringSession>;
  deleteSession(sessionId: string): Promise<void>;
  updateGoalStatus(goalId: string, status: GoalStatus): Promise<Goal>;
}

function repositoryError(action: string, detail?: string) {
  return new Error(
    detail ? `Could not ${action}. ${detail}` : `Could not ${action}.`,
  );
}

function mapSession(session: SessionRow): TutoringSession {
  return {
    id: session.id,
    assignmentId: session.assignment_id,
    date: session.session_date,
    durationMinutes: session.duration_minutes,
    notes: session.notes ?? undefined,
    createdAt: session.created_at,
  };
}

function mapGoal(goal: GoalRow): Goal {
  return {
    id: goal.id,
    studentId: goal.student_id,
    title: goal.title,
    category: goal.category,
    status: goal.status,
    createdAt: goal.created_at,
    completedAt: goal.completed_at,
  };
}

export const supabaseRepository: DemoDataRepository = {
  async load() {
    const supabase = getSupabaseClient();
    const [tutorsResult, studentsResult, assignmentsResult, sessionsResult, goalsResult] =
      await Promise.all([
        supabase.from("tutors").select("*").order("name"),
        supabase.from("students").select("*").order("name"),
        supabase.from("assignments").select("*").order("start_date"),
        supabase.from("sessions").select("*").order("session_date"),
        supabase.from("goals").select("*").order("created_at"),
      ]);

    const failedResult = [
      tutorsResult,
      studentsResult,
      assignmentsResult,
      sessionsResult,
      goalsResult,
    ].find((result) => result.error);

    if (failedResult?.error) {
      throw repositoryError("load program data", failedResult.error.message);
    }

    return {
      tutors: (tutorsResult.data ?? []).map((tutor) => ({
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
      })),
      students: (studentsResult.data ?? []).map((student) => ({
        id: student.id,
        name: student.name,
        tutoringSite: student.tutoring_site,
        status: student.status,
      })),
      assignments: (assignmentsResult.data ?? []).map((assignment) => ({
        id: assignment.id,
        tutorId: assignment.tutor_id,
        studentId: assignment.student_id,
        termLabel: assignment.term_label,
        startDate: assignment.start_date,
        endDate: assignment.end_date,
      })),
      sessions: (sessionsResult.data ?? []).map(mapSession),
      goals: (goalsResult.data ?? []).map(mapGoal),
    };
  },

  async addSession(session) {
    const { data, error } = await getSupabaseClient()
      .from("sessions")
      .insert({
        id: session.id,
        assignment_id: session.assignmentId,
        session_date: session.date,
        duration_minutes: session.durationMinutes,
        notes: session.notes ?? null,
        created_at: session.createdAt,
      })
      .select()
      .single();

    if (error || !data) {
      throw repositoryError("save the session", error?.message);
    }

    return mapSession(data);
  },

  async deleteSession(sessionId) {
    const { error } = await getSupabaseClient()
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      throw repositoryError("delete the session", error.message);
    }
  },

  async updateGoalStatus(goalId, status) {
    const { data, error } = await getSupabaseClient()
      .from("goals")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error || !data) {
      throw repositoryError("update the goal", error?.message);
    }

    return mapGoal(data);
  },
};
