import { kratos } from "./utils";
import { Session } from "@ory/client";
import { createContext, useContext, useEffect, useState } from "react";

export type AuthContext = {
  session: Session | null;
  client: typeof kratos;
};

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      console.log("fetching session");
      const { data: session } = await kratos.toSession();
      console.log("session in auth", session);
      setSession(session);
    };
    fetchSession().catch(console.error);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        client: kratos,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
