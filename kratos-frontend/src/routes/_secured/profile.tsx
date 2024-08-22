import { createFileRoute } from "@tanstack/react-router";
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
import { UpdateSettingsFlowBody, SettingsFlow } from "@ory/client";
import {
  getInputAttributeValue,
  kratos,
  KratosFlowSearchParams,
} from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_secured/profile")({
  component: () => <Profile />,
  validateSearch: (search: Record<string, unknown>): KratosFlowSearchParams => {
    return {
      flow: (search.flow as string) || "",
    };
  },
});

function Profile() {
  const [flow, setFlow] = useState<SettingsFlow | null>(null);
  const [settings, setSettings] = useState<SettingsFlow | null>(null);
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: flow?.identity.traits.name.first || "",
      lastName: flow?.identity.traits.name.last || "",
      email: flow?.identity.traits.email || "",
    },
    onSubmit: async ({ value }) => {
      const csrf_token = getInputAttributeValue(flow!.ui.nodes, "csrf_token");
      const req: UpdateSettingsFlowBody = {
        method: "profile",
        csrf_token: csrf_token,
        traits: {
          email: value.email,
          name: {
            first: value.firstName,
            last: value.lastName,
          },
        },
      };

      await submitFlow(req);
      console.log(value);
    },
  });

  const getFlow = useCallback(async (flowId: string) => {
    console.log("getFlow", flowId);

    // the flow data contains the form fields, error messages and csrf token
    try {
      const { data: flow } = await kratos.getSettingsFlow({ id: flowId });
      setFlow(flow);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createFlow = async () => {
    console.log("createFlow");

    try {
      const { data: flow } = await kratos.createBrowserSettingsFlow();

      setFlow(flow);
      console.log("created flow", flow);

      navigate({ to: "/profile", search: () => ({ flow: flow.id }) });
    } catch (error) {
      console.error(error);
    }
  };

  const submitFlow = async (body: UpdateSettingsFlowBody) => {
    console.log("submitFlow", body);
    if (!flow) return navigate({ replace: true });
    try {
      const { data: settings } = await kratos.updateSettingsFlow({
        flow: flow.id,
        updateSettingsFlowBody: body,
      });
      setSettings(settings);

      console.log("flow updated");

      navigate({ replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const flowId = searchParams.flow;
    if (flowId && flowId !== "") {
      getFlow(flowId).catch(() => createFlow()); // if for some reason the flow has expired, we need to get a new one
      return;
    }
    createFlow();
  }, []);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
        {settings?.ui.messages?.map((m) => (
          <Alert variant="default" key={m.id}>
            <AlertCircle className="h-4 w-4" />
            {/* <AlertTitle>Error</AlertTitle> */}
            <AlertDescription>{m.text}</AlertDescription>
          </Alert>
        ))}
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
            <Button type="submit" className="w-full">
              Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
