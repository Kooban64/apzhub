import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="finance" title="Finance">
      {children}
    </OperatorShellLayout>
  );
}
