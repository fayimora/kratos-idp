import { StrictMode } from "react";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./lib/auth";
import { configure, getConsoleSink } from "@logtape/logtape";

const router = createRouter({
  routeTree,
  context: {
    session: undefined!,
    client: undefined!,
    isAuthenticated: false,
  },
  // defaultPreload: "intent"
});

await configure({
  sinks: { console: getConsoleSink() },
  filters: {},
  loggers: [
    { category: "kratos-idp-frontend", level: "info", sinks: ["console"] },
  ],
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

function InnerApp() {
  const auth = useAuth();
  return (
    <RouterProvider
      router={router}
      // defaultPreload="intent"
      context={{
        session: auth.session,
        client: auth.client,
        isAuthenticated: false,
      }}
    />
  );
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
      {/* <RouterProvider router={router} /> */}
    </StrictMode>,
  );
}
