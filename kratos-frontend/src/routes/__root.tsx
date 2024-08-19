import { kratos } from "@/lib/utils";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { Session } from "@ory/client";

export const Route = createRootRoute({
  component: () => <Root />,
});

function Root() {
  const [logoutUrl, setLogoutUrl] = useState<string>();
  const [session, setSession] = useState<Session | null>(null);

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
    kratos.toSession().then(({ data: session }) => {
      setSession(session);
      createLogoutFlow();
    });
  }, []);

  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        {session ? (
          <Link to={logoutUrl} replace={true} className="[&.active]:font-bold">
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
