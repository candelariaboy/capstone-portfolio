"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

/**
 * Hook for subscribing to real-time user updates
 * Listens for changes to users table (points, level, badges)
 */
export function useRealtimeUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchUsers = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .order("points", { ascending: false })
          .limit(20);

        if (data) {
          setUsers(data as User[]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    // Subscribe to real-time updates on users table
    const subscription = supabase
      .channel("public:users")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for INSERT, UPDATE, DELETE
          schema: "public",
          table: "users",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            // Update user in local state
            setUsers((prevUsers) => {
              const updated = prevUsers.map((u) =>
                u.id === payload.new.id ? (payload.new as User) : u
              );
              // Re-sort by points
              return updated.sort((a, b) => b.points - a.points);
            });
          } else if (payload.eventType === "INSERT") {
            // Add new user
            setUsers((prevUsers) => {
              const updated = [...prevUsers, payload.new as User];
              return updated.sort((a, b) => b.points - a.points).slice(0, 20);
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { users, isLoading };
}

/**
 * Hook for subscribing to real-time badge updates
 * Listens for new badges earned
 */
export function useRealtimeBadges(userId?: string) {
  const [newBadges, setNewBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to badge updates for this user
    const subscription = supabase
      .channel(`badges:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "badges",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNewBadges((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { newBadges };
}

/**
 * Hook for subscribing to real-time points updates
 * Listens for user points and level changes
 */
export function useRealtimePoints(userId?: string) {
  const [pointsUpdate, setPointsUpdate] = useState<{
    points: number;
    level: number;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to user points updates
    const subscription = supabase
      .channel(`points:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setPointsUpdate({
              points: payload.new.points,
              level: payload.new.level,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { pointsUpdate };
}
