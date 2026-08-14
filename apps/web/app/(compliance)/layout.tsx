import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="compliance" title="Compliance">
      {children}
    </OperatorShellLayout>
  );
}
