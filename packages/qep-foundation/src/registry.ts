import { QEP_MODULES, type QepModuleDescriptor } from "@apzhub/qep-types";

export type QepFoundationHealth = {
  productId: "apzqep";
  status: "foundation_ready";
  moduleStubCount: number;
  businessFunctionality: false;
};

export function listQepModuleStubs(): readonly QepModuleDescriptor[] {
  return QEP_MODULES;
}

export function getQepFoundationHealth(): QepFoundationHealth {
  return {
    productId: "apzqep",
    status: "foundation_ready",
    moduleStubCount: QEP_MODULES.length,
    businessFunctionality: false,
  };
}
