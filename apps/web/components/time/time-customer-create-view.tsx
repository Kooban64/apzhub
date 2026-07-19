"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { writeLastCustomerId } from "@/lib/time/preferences";
import { customersPath } from "@/lib/time/routes";
import { createCustomer } from "@/lib/time/time-api";

import { ErrorState, PageShell } from "./time-ui";

export function TimeCustomerCreateView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createCustomer({
        name: name.trim(),
        number: number.trim() || undefined,
      }),
    onSuccess: (customer) => {
      writeLastCustomerId(customer.id);
      router.push(customersPath());
    },
  });

  return (
    <PageShell
      title="Create customer"
      description="Create a customer through the Platform Time API."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(customersPath())}
        >
          Cancel
        </Button>
      }
    >
      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="time-customer-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          data-testid="time-customer-create-name"
        />
        <Input
          label="Number"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          data-testid="time-customer-create-number"
        />
        {mutation.isError ? (
          <ErrorState
            message={
              isTimeApiError(mutation.error)
                ? mutation.error.message
                : "Unable to create customer."
            }
          />
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || !name.trim()}
          data-testid="time-customer-create-submit"
        >
          {mutation.isPending ? "Creating…" : "Create customer"}
        </Button>
      </form>
    </PageShell>
  );
}
