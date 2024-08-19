import { Button } from "@/components/ui/button";
import { kratos } from "@/lib/utils";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Session } from "@ory/client";

export const Route = createLazyFileRoute("/")({
  component: () => <Index />,
});

function Index() {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  const navigate = useNavigate();

  const getSession = async () => {
    try {
      const { data: session } = await kratos.toSession();
      console.log("session", session);
      setSession(session);
    } catch (error) {
      console.error(error);
      navigate({ to: "/login" });
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <>
      <div className="flex flex-row space-x-2 space-y-2">
        <h1>Vite + React + Tailwind + shadcn/ui</h1>
        <div className="card">
          <Button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </Button>
        </div>
      </div>
    </>
  );
}

