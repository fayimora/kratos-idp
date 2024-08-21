import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: () => <Index />,
});

function Index() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-row space-x-2 space-y-2">
        <h1>Vite + React + Tailwind + shadcn/ui + Ory/kratos</h1>
        <div className="card">
          <Button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </Button>
        </div>
      </div>
    </>
  );
}
