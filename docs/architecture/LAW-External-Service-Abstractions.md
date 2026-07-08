# LAW — External Service Abstractions

> **Milestone:** LAW-014 — Integration Foundation (planning)  
> **Status:** **Interface definitions only** — no implementation, no production code  
> **Authority:** [LAW-Integration-Reference-Architecture](./LAW-Integration-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

This document defines platform-agnostic service interfaces for external capabilities. Workflows, API handlers, and background workers depend on these abstractions — never on vendor SDKs directly.

**These interfaces are planning artefacts.** TypeScript definitions below are the target contract for `packages/legal-integrations/` (proposed package, future).

---

## 2. Design rules

| Rule                 | Detail                                                 |
| -------------------- | ------------------------------------------------------ |
| Vendor isolation     | No AWS/Stripe/Twilio types past adapter layer          |
| Tenant configuration | Adapter selected per `tenantId` via integration config |
| Idempotency          | Mutating operations accept `idempotencyKey`            |
| Diagnostics          | Every service exposes `getDiagnostics()` for health    |
| Stub implementations | `NoOp*` and `InMemory*` stubs for dev/CI               |
| Async                | All operations return `Promise`                        |

---

## 3. Common types

```typescript
/** Shared integration types — planning only */

export interface IntegrationDiagnostics {
  readonly status: "ready" | "degraded" | "unavailable";
  readonly provider: string;
  readonly message?: string;
}

export interface IntegrationContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
}

export interface IntegrationResult<T> {
  readonly ok: boolean;
  readonly value?: T;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}
```

---

## 4. FileStorageService

Document blobs are stored externally; metadata remains in `law_document`.

```typescript
export interface FileUploadRequest {
  readonly tenantId: string;
  readonly documentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly checksumSha256?: string;
}

export interface FileUploadGrant {
  readonly uploadUrl: string;
  readonly storageKey: string;
  readonly expiresAt: string;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface FileDownloadGrant {
  readonly downloadUrl: string;
  readonly expiresAt: string;
}

export interface FileMetadata {
  readonly storageKey: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly checksumSha256?: string;
}

export interface FileStorageService {
  /** Issue a pre-signed URL for client-side upload */
  createUploadGrant(
    context: IntegrationContext,
    request: FileUploadRequest,
  ): Promise<IntegrationResult<FileUploadGrant>>;

  /** Verify upload completed and return stored metadata */
  finalizeUpload(
    context: IntegrationContext,
    storageKey: string,
  ): Promise<IntegrationResult<FileMetadata>>;

  /** Issue a time-limited download URL */
  createDownloadGrant(
    context: IntegrationContext,
    storageKey: string,
  ): Promise<IntegrationResult<FileDownloadGrant>>;

  /** Remove blob from storage */
  deleteObject(
    context: IntegrationContext,
    storageKey: string,
  ): Promise<IntegrationResult<void>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Planned adapters:** `S3FileStorageAdapter`, `LocalFileStorageAdapter` (dev), `NoOpFileStorageAdapter` (CI).

---

## 5. EmailService

```typescript
export interface EmailAddress {
  readonly email: string;
  readonly name?: string;
}

export interface EmailAttachment {
  readonly fileName: string;
  readonly mimeType: string;
  readonly contentBase64: string;
}

export interface SendEmailRequest {
  readonly to: readonly EmailAddress[];
  readonly cc?: readonly EmailAddress[];
  readonly bcc?: readonly EmailAddress[];
  readonly subject: string;
  readonly htmlBody?: string;
  readonly textBody?: string;
  readonly attachments?: readonly EmailAttachment[];
  readonly templateId?: string;
  readonly templateData?: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
}

export interface SendEmailResult {
  readonly messageId: string;
  readonly provider: string;
}

export interface EmailService {
  send(
    context: IntegrationContext,
    request: SendEmailRequest,
  ): Promise<IntegrationResult<SendEmailResult>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Planned adapters:** `SesEmailAdapter`, `SmtpEmailAdapter` (dev), `LoggingEmailAdapter` (CI).

---

## 6. SmsService

```typescript
export interface SendSmsRequest {
  readonly toE164: string;
  readonly body: string;
  readonly idempotencyKey: string;
}

export interface SendSmsResult {
  readonly messageId: string;
  readonly provider: string;
}

export interface SmsService {
  send(
    context: IntegrationContext,
    request: SendSmsRequest,
  ): Promise<IntegrationResult<SendSmsResult>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Planned adapters:** `TwilioSmsAdapter`, `LoggingSmsAdapter` (CI).

---

## 7. PdfGenerationService

```typescript
export type PdfDocumentType = "invoice" | "matter_summary" | "report";

export interface GeneratePdfRequest {
  readonly documentType: PdfDocumentType;
  readonly entityId: string;
  readonly templateId?: string;
  readonly locale?: string;
}

export interface GeneratePdfResult {
  readonly storageKey: string;
  readonly sizeBytes: number;
  readonly pageCount: number;
}

export interface PdfGenerationService {
  generate(
    context: IntegrationContext,
    request: GeneratePdfRequest,
  ): Promise<IntegrationResult<GeneratePdfResult>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Note:** LAW-013 established PDF placeholders in UI only. This service is the future generation path.

**Planned adapters:** `HtmlToPdfAdapter` (headless Chrome / external API), `StubPdfAdapter` (returns placeholder bytes in dev).

---

## 8. OcrService

```typescript
export interface OcrRequest {
  readonly storageKey: string;
  readonly mimeType: string;
  readonly language?: string;
}

export interface OcrResult {
  readonly text: string;
  readonly confidence: number;
  readonly pageCount: number;
}

export interface OcrService {
  extractText(
    context: IntegrationContext,
    request: OcrRequest,
  ): Promise<IntegrationResult<OcrResult>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Status:** Deferred — no LAW-014 implementation story. Interface defined for architectural completeness.

**Planned adapters:** `TextractOcrAdapter`, `NoOpOcrAdapter`.

---

## 9. PaymentGatewayService

```typescript
export type PaymentStatus =
  "pending" | "authorised" | "captured" | "failed" | "refunded";

export interface CreatePaymentIntentRequest {
  readonly invoiceId: string;
  readonly amount: number;
  readonly currency: string;
  readonly idempotencyKey: string;
}

export interface PaymentIntentResult {
  readonly paymentIntentId: string;
  readonly clientSecret?: string;
  readonly status: PaymentStatus;
}

export interface CapturePaymentRequest {
  readonly paymentIntentId: string;
  readonly idempotencyKey: string;
}

export interface PaymentGatewayService {
  createPaymentIntent(
    context: IntegrationContext,
    request: CreatePaymentIntentRequest,
  ): Promise<IntegrationResult<PaymentIntentResult>>;

  capturePayment(
    context: IntegrationContext,
    request: CapturePaymentRequest,
  ): Promise<IntegrationResult<PaymentIntentResult>>;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Status:** Deferred — Trust Accounting milestone. Interface prevents ad-hoc payment code.

**Planned adapters:** `StripePaymentAdapter`, `NoOpPaymentAdapter`.

---

## 10. AccountingIntegrationService

```typescript
export type AccountingProvider = "xero" | "myob" | "quickbooks";

export interface SyncInvoiceRequest {
  readonly invoiceId: string;
  readonly idempotencyKey: string;
}

export interface SyncInvoiceResult {
  readonly externalInvoiceId: string;
  readonly provider: AccountingProvider;
  readonly syncedAt: string;
}

export interface AccountingIntegrationService {
  syncInvoice(
    context: IntegrationContext,
    request: SyncInvoiceRequest,
  ): Promise<IntegrationResult<SyncInvoiceResult>>;

  getConnectionStatus(
    context: IntegrationContext,
  ): Promise<
    IntegrationResult<{
      readonly connected: boolean;
      readonly provider?: AccountingProvider;
    }>
  >;

  getDiagnostics(): IntegrationDiagnostics;
}
```

**Status:** Deferred — post payment gateway.

**Planned adapters:** `XeroAccountingAdapter`, `NoOpAccountingAdapter`.

---

## 11. Service registry (planned)

```typescript
export interface ExternalServiceRegistry {
  readonly fileStorage: FileStorageService;
  readonly email: EmailService;
  readonly sms: SmsService;
  readonly pdf: PdfGenerationService;
  readonly ocr: OcrService;
  readonly payment: PaymentGatewayService;
  readonly accounting: AccountingIntegrationService;
}

export function createExternalServiceRegistry(options: {
  readonly tenantId: string;
  readonly mode: "production" | "stub";
}): ExternalServiceRegistry;
```

Factory resolves adapters from tenant `integration_config` (future table).

---

## 12. Package layout (proposed)

```text
packages/legal-integrations/
  src/
    interfaces/
      file-storage-service.ts
      email-service.ts
      ...
    adapters/
      s3-file-storage-adapter.ts
      logging-email-adapter.ts
      ...
    registry/
      create-external-service-registry.ts
    stubs/
      noop-*.ts
```

---

## 13. Implementation stories

| Interface                    | Story                      |
| ---------------------------- | -------------------------- |
| FileStorageService           | LAW-014-11                 |
| EmailService, SmsService     | LAW-014-12                 |
| PdfGenerationService         | LAW-014-13 (future)        |
| OcrService                   | Post-LAW-014               |
| PaymentGatewayService        | Trust Accounting milestone |
| AccountingIntegrationService | Post payment gateway       |

---

## 14. Related documents

| Document                                                                | Purpose                   |
| ----------------------------------------------------------------------- | ------------------------- |
| [LAW-Background-Job-Architecture](./LAW-Background-Job-Architecture.md) | Jobs that invoke services |
| [LAW-014 Backlog](../backlog/LAW-014-integration-foundation-backlog.md) | Stories                   |
