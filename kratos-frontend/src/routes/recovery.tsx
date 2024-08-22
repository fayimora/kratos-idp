import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { getInputAttributeValue, KratosFlowSearchParams } from "@/lib/utils";
import {
  RecoveryFlow,
  UpdateRecoveryFlowBody,
  UpdateRecoveryFlowWithCodeMethod,
} from "@ory/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/recovery")({
  component: () => <AccountRecovery />,
  validateSearch: (search: Record<string, unknown>): KratosFlowSearchParams => {
    return {
      flow: (search.flow as string) || "",
    };
  },
});

function AccountRecovery() {
  const searchParams = Route.useSearch();
  const hasFlowId = searchParams.flow && searchParams.flow !== "";

  return hasFlowId ? <VerifyCodeForm /> : <RequestCodeForm />;
}

function RequestCodeForm() {
  const [flow, setFlow] = useState<RecoveryFlow | null>(null);
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const { client } = useAuth();

  const form = useForm({
    defaultValues: {
      email: searchParams.verifiable_address,
    },
    onSubmit: async ({ value }) => {
      const csrf_token = getInputAttributeValue(flow!.ui.nodes, "csrf_token");

      const recoverFlowBody: UpdateRecoveryFlowBody = {
        csrf_token: csrf_token,
        email: value.email,
        method: "code",
      };
      console.log("email recoveryBody", recoverFlowBody);
      submitFlow(recoverFlowBody);
      navigate({
        to: "/recovery",
        search: () => ({ flow: flow?.id }),
        replace: true,
      });
    },
  });

  const createFlow = () => {
    client
      .createBrowserRecoveryFlow()
      .then(({ data: flow }) => {
        setFlow(flow);
        console.log("created browser flow", flow);
      })
      .catch(console.error);
  };

  const submitFlow = (body: UpdateRecoveryFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate({ to: "/login", replace: true });

    client
      .updateRecoveryFlow({ flow: flow.id, updateRecoveryFlowBody: body })
      .then(({ data: flow }) => {
        // Form submission was successful, show the message to the user!
        setFlow(flow);
        console.log("update recovery flow:", flow);
      })
      .catch(console.error);
  };

  useEffect(() => {
    createFlow();
  }, []);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Account Recovery</CardTitle>
        <CardDescription>
          We will send you a code to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <form.Field
                name="email"
                children={(field) => (
                  <>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={field.state.value}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>

            <div className="grid gap-4">
              <Button type="submit" className="w-full">
                Get Code
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function VerifyCodeForm() {
  const [flow, setFlow] = useState<RecoveryFlow | null>(null);
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const { client } = useAuth();

  const form = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      const csrf_token = getInputAttributeValue(flow!.ui.nodes, "csrf_token");

      const recoverFlowBody: UpdateRecoveryFlowBody = {
        csrf_token: csrf_token,
        code: value.code,
        method: "code",
      };
      console.log("code recoveryBody", recoverFlowBody);
      submitFlow(recoverFlowBody);
    },
  });

  const getFlow = useCallback(
    (flowId: string) =>
      client
        .getRecoveryFlow({ id: flowId })
        .then(({ data: flow }) => {
          console.log("get recovery flow", flow);
          setFlow(flow);
        })
        .catch((err) => {
          console.error(err);
          navigate({ to: "/login", replace: true });
        }),
    [],
  );

  const submitFlow = (body: UpdateRecoveryFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate({ to: "/login", replace: true });

    client
      .updateRecoveryFlow({ flow: flow.id, updateRecoveryFlowBody: body })
      .then(({ data: flow }) => {
        setFlow(flow);
        console.log("update recovery flow:", flow);
      })
      .catch(({ response: { data: err } }) => {
        console.error(err);
        if (err.redirect_browser_to && err.redirect_browser_to !== "") {
          window.location.replace(err.redirect_browser_to);
        }
      });
  };

  useEffect(() => {
    if (searchParams.flow && searchParams.flow !== "") {
      getFlow(searchParams.flow);
    }
  }, []);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Account Recovery</CardTitle>
        <CardDescription>Please enter code we sent via email</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <form.Field
                name="code"
                children={(field) => (
                  <>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <div className="grid gap-4">
              {/* // an onclick handler to call the getCode function and pass the email */}
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

