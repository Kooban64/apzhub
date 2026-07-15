/** Manifest-derived integration capability metadata. */
export interface IntegrationCapabilityMetadata {
  readonly integrationId: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly userVisible: boolean;
  readonly engineBrandingHidden: boolean;
}
