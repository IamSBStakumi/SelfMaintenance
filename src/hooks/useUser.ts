import { useState, useCallback, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/supabase";

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      setUser(supabaseUser);
      return supabaseUser;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  }, [supabase]);

  return { user, loading, fetchUser, signOut };
};

export default useUser;
