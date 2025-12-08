"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/schemas";

type TeamRole = User["role"];

type Team = {
  id: string;
  name: string;
  role: TeamRole;
  icon: string | null;
};

type TeamContextValue = {
  teamId: string | null;
  setTeamId: (teamId: string | null) => void;
  teams: Team[];
  loadingTeams: boolean;
  currentTeamRole: string | null;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({
  defaultTeamId,
  children,
}: {
  defaultTeamId: string | null;
  children: React.ReactNode;
}) {
  const supabase = useSupabase();
  const { user, authLoading } = useAuth();
  const [teamId, setTeamIdState] = useState<string | null>(defaultTeamId);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamRole, setCurrentTeamRole] = useState<string | null>(null);
  const [persistedTeamId, setPersistedTeamId] = useState<string | null>(null);

  const storageKey = useMemo(
    () => (user?.id ? `folio:last-team:${user.id}` : null),
    [user?.id]
  );

  const persistTeamId = useCallback(
    (nextTeamId: string | null) => {
      if (!storageKey || typeof window === "undefined") return;

      if (nextTeamId) {
        window.localStorage.setItem(storageKey, nextTeamId);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    },
    [storageKey]
  );

  const setTeamId = useCallback(
    (nextTeamId: string | null) => {
      setTeamIdState(nextTeamId);
      persistTeamId(nextTeamId);
    },
    [persistTeamId]
  );

  const {
    data: fetchedTeams,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ["team-users", user?.id],
    enabled: Boolean(user?.id) && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (prev) => prev,
    retry: true,
    refetchInterval: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_users")
        .select("team_id, role, teams(name, icon)")
        .eq("user_id", user!.id);

      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.team_id,
        name: (row as { teams?: { name?: string | null } } | null)?.teams
          ?.name ?? "",
        icon: (row as { teams?: { icon?: string | null } } | null)?.teams
          ?.icon ?? null,
        role: row.role as Team["role"],
      }));
    },
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      const timeout = window.setTimeout(() => {
        setTeams([]);
        setTeamIdState(defaultTeamId);
        setCurrentTeamRole(null);
        setPersistedTeamId(null);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    if (storageKey && typeof window !== "undefined") {
      const storedTeamId = window.localStorage.getItem(storageKey);
      const timeout = window.setTimeout(() => {
        setPersistedTeamId(storedTeamId || null);
        if (storedTeamId) {
          setTeamIdState(storedTeamId);
        }
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [authLoading, user?.id, defaultTeamId, storageKey]);

  useEffect(() => {
    if (authLoading || !user?.id || !fetchedTeams) return;

    const timeout = window.setTimeout(() => {
      setTeams(fetchedTeams);

      const validIds = fetchedTeams.map((t) => t.id);
      const candidates = [
        teamId,
        persistedTeamId,
        defaultTeamId,
        fetchedTeams[0]?.id ?? null,
      ];
      const nextTeamId =
        candidates.find(
          (candidate) => candidate && validIds.includes(candidate)
        ) ?? null;

      if (nextTeamId !== teamId) {
        setTeamId(nextTeamId);
      }

      const current = fetchedTeams.find((t) => t.id === nextTeamId);
      setCurrentTeamRole(current ? current.role : null);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    authLoading,
    user?.id,
    fetchedTeams,
    teamId,
    defaultTeamId,
    persistedTeamId,
    setTeamId,
  ]);

  const value = useMemo(
    () => ({
      teamId,
      setTeamId,
      teams,
      loadingTeams:
        authLoading ||
        (isLoading && teams.length === 0) ||
        (isFetching && teams.length === 0),
      currentTeamRole,
    }),
    [teamId, setTeamId, teams, authLoading, isLoading, isFetching, currentTeamRole]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("useTeam must be used within TeamProvider");
  }
  return ctx;
}

export function useTeams() {
  const ctx = useTeam();
  return {
    teams: ctx.teams,
    loadingTeams: ctx.loadingTeams,
    setTeamId: ctx.setTeamId,
  };
}
