import { getLogger } from "@logtape/logtape";
import { kratos } from "./utils";
import { Session, UpdateLoginFlowBody } from "@ory/client";
import { createContext, useContext, useEffect, useState } from "react";

const logger = getLogger(["kratos-idp-frontend", "auth"]);

export interface AuthContext {
  session: Session | null;
  isAuthenticated: boolean;
  login: (flowId: string, body: UpdateLoginFlowBody) => Promise<void>;
  logout: () => Promise<void>;
  client: typeof kratos;
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!session?.active);

  useEffect(() => {
    kratos.toSession().then(({ data: session }) => {
      setSession(session);
      setIsAuthenticated(!!session?.active);
    });
  }, []);

  const login = async (flowId: string, body: UpdateLoginFlowBody) => {
    try {
      const { data: login } = await kratos.updateLoginFlow({
        flow: flowId,
        updateLoginFlowBody: body,
      });
      setSession(login.session);
      setIsAuthenticated(!!login.session.active);
    } catch (error) {
      logger.error("{error}", { error });
    }
    return Promise.resolve();
  };

  const logout = async () => {
    try {
      const { data: flow } = await kratos.createBrowserLogoutFlow();
      logger.info(`logout flow ${flow}`);
      // force browser to redirect to the logout url
      window.location.href = flow.logout_url;
    } catch (error) {
      console.error(logger.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        client: kratos,
        session: session,
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
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
