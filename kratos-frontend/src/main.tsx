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
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  },
  // defaultPreload: "intent"
});

await configure({
  sinks: { console: getConsoleSink() },
  filters: {},
  loggers: [
    { category: ["logtape", "meta"], level: "error", sinks: ["console"] },
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
  const { session, client, isAuthenticated, login, logout } = useAuth();
  return (
    <RouterProvider
      router={router}
      // defaultPreload="intent"
      context={{
        session: session,
        client: client,
        isAuthenticated: isAuthenticated,
        login: login,
        logout: logout,
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
