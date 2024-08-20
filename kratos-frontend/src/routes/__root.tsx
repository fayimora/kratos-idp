import { kratos } from "@/lib/utils";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { AuthContext, useAuth } from "@/lib/auth";

export const Route = createRootRouteWithContext<AuthContext>()({
  component: () => <Root />,
});

function Root() {
  const [logoutUrl, setLogoutUrl] = useState<string>();
  const { session } = useAuth();

  const createLogoutFlow = async () => {
    try {
      const { data: flow } = await kratos.createBrowserLogoutFlow();
      console.log("logout flow", flow);
      setLogoutUrl(flow.logout_url);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (session?.active) {
      createLogoutFlow();
    }
  }, [session]);

  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        {session ? (
          <Link to={logoutUrl} replace={true}>
            {" "}
            Sign Out{" "}
          </Link>
        ) : (
          <Link to="/login" className="[&.active]:font-bold">
            Sign In
          </Link>
        )}
        <Link to="/register" className="[&.active]:font-bold">
          Sign Up
        </Link>
        <Link to="/profile" className="[&.active]:font-bold">
          Profile
        </Link>
      </div>

      <hr />

      <div className="container">
        <div className="flex items-center justify-center h-screen">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
