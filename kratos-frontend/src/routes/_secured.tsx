import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_secured")({
  beforeLoad: ({ context, location }) => {
    console.log("auth index context", context);
    if (!context.session?.active) {
      console.log("redirecting to login");
      throw redirect({
        to: "/login",
      });
    }
    return context;
  },
  component: () => <AuthLayout />,
});

function AuthLayout() {
  return <Outlet />;
}
