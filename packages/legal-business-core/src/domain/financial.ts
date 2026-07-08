import type {
  BillingStatus,
  InvoiceStatus,
  PaymentStatus,
  TrustTransactionType,
} from "./enums";

export interface TimeEntry {
  readonly timeEntryId: string;
  readonly timeEntryReference: string;
  readonly matterId: string;
  readonly userId: string;
  readonly entryDate: string;
  readonly durationMinutes: number;
  readonly narrative: string;
  readonly activityCode?: string;
  readonly billable: boolean;
  readonly billingStatus: BillingStatus;
  readonly rate: number;
  readonly amount: number;
  readonly approvedByUserId?: string;
}

export interface Expense {
  readonly expenseId: string;
  readonly expenseReference: string;
  readonly matterId: string;
  readonly clientId: string;
  readonly expenseDate: string;
  readonly description: string;
  readonly amount: number;
  readonly currency: string;
  readonly taxAmount?: number;
  readonly receiptAttachmentId?: string;
  readonly billable: boolean;
  readonly billingStatus: BillingStatus;
}

export interface InvoiceLineItem {
  readonly lineItemId: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly amount: number;
  readonly matterId: string;
  readonly timeEntryId?: string;
  readonly expenseId?: string;
}

export interface Invoice {
  readonly invoiceId: string;
  readonly invoiceReference: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly invoiceStatus: InvoiceStatus;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly subtotal: number;
  readonly taxTotal: number;
  readonly total: number;
  readonly currency: string;
  readonly lineItems: readonly InvoiceLineItem[];
  readonly trustAppliedAmount?: number;
}

export interface TrustAccount {
  readonly trustAccountId: string;
  readonly trustAccountCode: string;
  readonly name: string;
  readonly currency: string;
  readonly institutionName: string;
  readonly accountNumberMasked: string;
  readonly balance: number;
  readonly isActive: boolean;
  readonly complianceRules: Readonly<Record<string, string>>;
}

export interface TrustTransaction {
  readonly trustTransactionId: string;
  readonly trustAccountId: string;
  readonly trustTransactionType: TrustTransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly invoiceId?: string;
  readonly paymentId?: string;
  readonly narrative: string;
  readonly runningBalance: number;
}

export interface Disbursement {
  readonly disbursementId: string;
  readonly matterId: string;
  readonly expenseId?: string;
  readonly amount: number;
  readonly disbursementDate: string;
  readonly vendorName: string;
  readonly invoiceId?: string;
  readonly recovered: boolean;
}

export interface Payment {
  readonly paymentId: string;
  readonly paymentReference: string;
  readonly paymentStatus: PaymentStatus;
  readonly amount: number;
  readonly currency: string;
  readonly paymentDate: string;
  readonly method: string;
  readonly clientId: string;
  readonly invoiceId?: string;
  readonly trustTransactionId?: string;
}

export interface InvoiceSearchCriteria {
  readonly query?: string;
  readonly clientId?: string;
  readonly invoiceStatus?: InvoiceStatus | "all";
}

export interface TimeSearchCriteria {
  readonly matterId?: string;
  readonly userId?: string;
  readonly entryDateFrom?: string;
  readonly entryDateTo?: string;
}
