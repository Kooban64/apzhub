/** Stable `adapter_*` subsystem id segment for connector rows on the admin health strip. */
export function connectorHealthDomainId(connectorId: string): string {
  return `conn_${connectorId.replace(/[^a-zA-Z0-9]+/g, "_")}`;
}
