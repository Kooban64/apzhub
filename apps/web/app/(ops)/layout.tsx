import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="ops" title="Platform Ops">
      {children}
    </OperatorShellLayout>
  );
}
