import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import {
  LoginFlow,
  UpdateLoginFlowBody,
  UiNodeInputAttributes,
} from "@ory/client";
import { useCallback, useEffect, useState } from "react";
import { kratos, LoginSearchParams } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: () => <LoginForm />,
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      flow: (search.flow as string) || "",
    };
  },
});

function LoginForm() {
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      csrf_token: "",
    },
    onSubmit: async ({ value }) => {
      const csrf_token = (
        loginFlow?.ui.nodes.find(
          (n) =>
            n.type === "input" &&
            (n.attributes as UiNodeInputAttributes).name === "csrf_token",
        )?.attributes as UiNodeInputAttributes
      ).value as string;

      const loginFlowBody: UpdateLoginFlowBody = {
        csrf_token: csrf_token,
        identifier: value.email,
        method: "password",
        password: value.password,
      };
      console.log(loginFlowBody);
      await submitFlow(loginFlowBody);
    },
  });

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(async (flowId: string) => {
    console.log("getFlow", flowId);

    // the flow data contains the form fields, error messages and csrf token
    try {
      const { data: flow } = await kratos.getLoginFlow({ id: flowId });
      return setLoginFlow(flow);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createFlow = async () => {
    console.log("createFlow");

    try {
      const { data: flow } = await kratos.createBrowserLoginFlow({
        // returnTo: "/", // redirect to the root path after login
        // if the user has a session, refresh it
        refresh: true,
        // if the aal2 query parameter is set, we get the two factor login flow UI nodes
        aal: "aal1", //aal2 ? "aal2" : "aal1",
      });

      setLoginFlow(flow);
      console.log("created flow", flow);

      navigate({ to: "/login", search: () => ({ flow: flow.id }) });
    } catch (error) {
      console.error(error);
    }
  };

  // submit the login form data to Ory
  const submitFlow = async (body: UpdateLoginFlowBody) => {
    console.log("submitFlow", body);
    if (!loginFlow) return navigate({ to: "/login", replace: true });

    try {
      await kratos.updateLoginFlow({
        flow: loginFlow.id,
        updateLoginFlowBody: body,
      });
      console.log("flow updated");

      navigate({ to: "/", replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // check if the login flow is for two factor authentication
    // const aal2 = searchParams.get("aal2");
    // we can redirect the user back to the page they were on before login
    // const returnTo = undefined; //searchParams.get("return_to");

    const flowId = searchParams.flow;
    if (flowId) {
      getFlow(flowId).catch(() => createFlow()); // if for some reason the flow has expired, we need to get a new one
      return;
    }
    createFlow();
  }, []);

  return loginFlow ? (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials below to access your account
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
                      placeholder="m@example.com"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <form.Field
                name="password"
                children={(field) => (
                  <Input
                    id="password"
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </div>
            <form.Field
              name="csrf_token"
              children={(field) => (
                <Input
                  type="hidden"
                  name={field.name}
                  value={field.state.value}
                />
              )}
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  ) : (
    <h3>Loading...</h3>
  );
}
