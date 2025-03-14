import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContext, useAuth } from "@/lib/auth";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["kratos-idp-frontend", "routes", "root"]);

export const Route = createRootRouteWithContext<AuthContext>()({
  component: () => <Root />,
});

function Root() {
  const { session, logout } = useAuth();

  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        {session ? (
          <Link to="" onClick={() => logout()} replace={true}>
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
        <Link to="/recovery" className="[&.active]:font-bold">
          Recovery
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
