import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/")({
  component: () => <Index />,
});

function Index() {
  const [count, setCount] = useState(0);
  const { session } = useAuth();

  return (
    <>
      <div className="flex flex-row space-x-2 space-y-2">
        <h1>Vite + React + Tailwind + shadcn/ui + Ory/kratos</h1>
        <div className="card">
          <Button onClick={() => setCount((count) => count + 1)}>
            {session?.identity?.traits.name.first} count is {count}
          </Button>
        </div>
      </div>
    </>
  );
}
