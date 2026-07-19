/** Vendor DTOs for Kimai CE JSON API — adapter-internal only. */

export interface KimaiVersionResponse {
  readonly version?: string;
  readonly kimai?: string;
  readonly name?: string;
}

export interface KimaiTimesheetRecord {
  readonly id: number;
  readonly begin: string;
  readonly end?: string | null;
  readonly duration?: number;
  readonly description?: string | null;
  readonly activity?: number | null;
  readonly project?: number | null;
  readonly customer?: number | null;
  readonly user?: number | null;
  readonly tags?: readonly string[];
  readonly billable?: boolean;
  readonly exported?: boolean;
}

export interface KimaiActivityRecord {
  readonly id: number;
  readonly name: string;
  readonly comment?: string | null;
  readonly visible?: boolean;
  readonly project?: number | null;
}

export interface KimaiCustomerRecord {
  readonly id: number;
  readonly name: string;
  readonly number?: string | null;
  readonly visible?: boolean;
}

export interface KimaiProjectRecord {
  readonly id: number;
  readonly name: string;
  readonly customer?: number | null;
  readonly visible?: boolean;
}

export interface KimaiTagRecord {
  readonly id: number;
  readonly name: string;
  readonly color?: string | null;
}

export interface KimaiTimesheetWriteBody {
  readonly begin?: string;
  readonly end?: string | null;
  readonly description?: string | null;
  readonly activity?: number | null;
  readonly project?: number | null;
  readonly tags?: readonly string[];
  readonly billable?: boolean;
}

export interface KimaiActivityWriteBody {
  readonly name?: string;
  readonly comment?: string | null;
  readonly project?: number | null;
  readonly visible?: boolean;
}

export interface KimaiCustomerWriteBody {
  readonly name?: string;
  readonly number?: string | null;
  readonly visible?: boolean;
}

export interface KimaiProjectWriteBody {
  readonly name?: string;
  readonly customer?: number | null;
  readonly visible?: boolean;
}

export interface KimaiTagWriteBody {
  readonly name?: string;
  readonly color?: string | null;
}

export interface KimaiListQuery {
  readonly page?: number;
  readonly size?: number;
  readonly term?: string;
  readonly visible?: number;
}
