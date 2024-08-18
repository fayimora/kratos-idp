import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      {/* <div className="p-2 flex gap-2"> */}
      {/*   <Link to="/" className="[&.active]:font-bold"> */}
      {/*     Home */}
      {/*   </Link>{" "} */}
      {/* </div> */}

      <hr />

      <div className="container">
        <div className="flex items-center justify-center h-screen">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
