import { getProfileAdapter } from "@/lib/adapters/profile/profile-adapter";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function POST(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  return attach(await getProfileAdapter().connectGoogle());
}
