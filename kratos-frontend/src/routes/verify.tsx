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
  VerificationFlow,
  UpdateVerificationFlowBody,
  UiNodeInputAttributes,
} from "@ory/client";
import { useCallback, useEffect, useState } from "react";
import { kratos, KratosFlowSearchParams } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  component: () => <VerifyForm />,
  validateSearch: (search: Record<string, unknown>): KratosFlowSearchParams => {
    return {
      flow: (search.flow as string) || "",
      code: (search.code as string) || "",
    };
  },
});

function VerifyForm() {
  const [flow, setFlow] = useState<VerificationFlow | null>(null);

  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const form = useForm({
    defaultValues: {
      email: searchParams.verifiable_address,
      code: searchParams.code,
    },
    onSubmit: async ({ value }) => {
      const csrf_token = (
        flow?.ui.nodes.find(
          (n) =>
            n.type === "input" &&
            (n.attributes as UiNodeInputAttributes).name === "csrf_token",
        )?.attributes as UiNodeInputAttributes
      ).value as string;

      const verifyFlowBody: UpdateVerificationFlowBody = {
        code: value.code,
        csrf_token: csrf_token,
        email: value.email,
        method: "code",
      };
      console.log("verifyBody", verifyFlowBody);
      submitFlow(verifyFlowBody);
    },
  });

  const getFlow = useCallback(async (flowId: string) => {
    console.log("getFlow", flowId);

    // the flow data contains the form fields, error messages and csrf token
    try {
      const { data: flow } = await kratos.getVerificationFlow({ id: flowId });
      console.log("verificationFlow", flow);
      return setFlow(flow);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createFlow = async () => {
    console.log("createFlow");

    try {
      const { data: flow } = await kratos.createBrowserVerificationFlow({});

      setFlow(flow);
      console.log("created flow", flow);

      navigate({ to: "/verify", search: () => ({ flow: flow.id }) });
    } catch (error) {
      console.error(error);
    }
  };

  const submitFlow = async (body: UpdateVerificationFlowBody) => {
    console.log("submitFlow", body);
    if (!flow) return navigate({ to: "/verify", replace: true });

    try {
      const { data: verification } = await kratos.updateVerificationFlow({
        flow: flow.id,
        updateVerificationFlowBody: body,
      });
      console.log("flow updated");
      setFlow(verification);

      navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (searchParams.flow) {
      getFlow(searchParams.flow).catch(createFlow);
      return;
    }
    createFlow();
  }, []);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          Enter the code provided in your email below
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
            {searchParams.verifiable_address ? (
              <div className="grid gap-2">
                <form.Field
                  name="email"
                  children={(field) => (
                    <>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        disabled
                        placeholder={field.state.value}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
            ) : null}
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
            <div className="grid gap-2">
              <Button type="submit" className="w-full">
                Verify
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

