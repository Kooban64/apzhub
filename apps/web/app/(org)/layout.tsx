import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="org" title="Organisation">
      {children}
    </OperatorShellLayout>
  );
}
