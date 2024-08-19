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
import { useCallback, useEffect, useState } from "react";
import { RegistrationFlow } from "@ory/client";
import { kratos, KratosFlowSearchParams } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  component: () => <SignUpForm />,
  validateSearch: (search: Record<string, unknown>): KratosFlowSearchParams => {
    return {
      flow: (search.flow as string) || "",
    };
  },
});

function SignUpForm() {
  const [registrationFlow, setRegistrationFlow] = useState<RegistrationFlow>();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  const getFlow = useCallback(async (flowId: string) => {
    console.log("getFlow", flowId);

    // the flow data contains the form fields, error messages and csrf token
    try {
      const { data: flow } = await kratos.getRegistrationFlow({ id: flowId });
      return setRegistrationFlow(flow);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createFlow = async () => {
    console.log("createFlow");

    try {
      const { data: flow } = await kratos.createBrowserRegistrationFlow({});

      setRegistrationFlow(flow);
      console.log("created flow", flow);

      navigate({ to: "/register", search: () => ({ flow: flow.id }) });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // we cant create registration flow if there is a valid session. User must log out first
    kratos.toSession().then(() => navigate({ to: "/" }));

    const flowId = searchParams.flow;
    if (flowId) {
      getFlow(flowId).catch(() => createFlow()); // if for some reason the flow has expired, we need to get a new one
      return;
    }
    createFlow();
  }, []);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <form.Field
                  name="firstName"
                  children={(field) => (
                    <>
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
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
                <form.Field
                  name="lastName"
                  children={(field) => (
                    <>
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <form.Field
                name="email"
                children={(field) => (
                  <>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
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
              <form.Field
                name="password"
                children={(field) => (
                  <>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
