import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function ApzpenLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="apzpen" title="Security Assurance">
      {children}
    </OperatorShellLayout>
  );
}
