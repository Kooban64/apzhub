import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex max-w-md flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive"
      role="alert"
      data-testid="error-state"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-destructive/90">{description}</p>
      {onRetry ? (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
