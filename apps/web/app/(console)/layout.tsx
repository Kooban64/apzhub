import { OperatorShellLayout } from "@/components/operator/operator-shell-layout";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorShellLayout shell="console" title="Platform Console">
      {children}
    </OperatorShellLayout>
  );
}
