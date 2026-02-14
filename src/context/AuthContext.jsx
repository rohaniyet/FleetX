import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sessionUser.id)
          .single();

        setRole(roleData?.role ?? "user");
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
