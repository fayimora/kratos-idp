import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    console.log("auth index context", context);
    if (!context.session?.active) {
      throw redirect({
        to: "/login",
      });
    }
    return context.session;
  },
  component: () => <Outlet />,
});
