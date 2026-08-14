import type { CSSProperties, ReactNode } from "react";
import { headers } from "next/headers";

import { CookieNotice } from "@/components/marketing/cookie-notice";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { getMarketingSite, resolveMarketingSiteFromHost } from "@/lib/marketing/sites";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const host = (await headers()).get("host");
  const site = getMarketingSite(resolveMarketingSiteFromHost(host));

  return (
    <div
      className="flex min-h-full flex-col"
      style={
        {
          "--font-display":
            '"IBM Plex Sans Condensed", "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
        } as CSSProperties
      }
    >
      <MarketingHeader site={site} />
      <main className="flex-1">{children}</main>
      <MarketingFooter site={site} />
      <CookieNotice />
    </div>
  );
}
