import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/supabase";

export const USER_QUERY_KEY = ["user"] as const;

const useUser = (): {
  user: User | null | undefined;
  loading: boolean;
  signOut: () => Promise<void>;
} => {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return user ?? null;
    },
  });

  const { mutateAsync: signOut } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
  });

  return { user, loading, signOut };
};

export default useUser;
