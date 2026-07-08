"use client";

import dynamic from "next/dynamic";

import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

interface LawApiSwaggerExplorerProps {
  readonly specUrl: string;
}

/** Interactive OpenAPI explorer (Swagger UI) for Law Platform API (LAW-014-07). */
export function LawApiSwaggerExplorer({ specUrl }: LawApiSwaggerExplorerProps) {
  return (
    <div
      className="law-api-swagger-ui min-h-[640px] rounded-lg border border-zinc-200 bg-white shadow-sm"
      data-testid="law-api-swagger-explorer"
    >
      <SwaggerUI
        url={specUrl}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration
        filter
        persistAuthorization
        tryItOutEnabled
        requestInterceptor={(request) => {
          request.headers["x-correlation-id"] ??= `docs-explorer-${Date.now()}`;
          return request;
        }}
      />
    </div>
  );
}
