import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        setLoading(false);
        return;
      }

      setUser(sessionUser);

      // Get tenant
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .limit(1)
        .single();

      // Get branch
      const { data: branchData } = await supabase
        .from("branches")
        .select("*")
        .limit(1)
        .single();

      setTenant(tenantData);
      setBranch(branchData);
      setLoading(false);
    };

    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, branch, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
