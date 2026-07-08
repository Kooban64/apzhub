export { AddressValidator } from "./address-validator";
export { ClientValidator, type ClientFormInput } from "./client-validator";
export { EmailValidator, type EmailInput } from "./email-validator";
export { MatterValidator, type MatterFormInput } from "./matter-validator";
export { PhoneValidator } from "./phone-validator";
export {
  isClientReference,
  isInvoiceReference,
  isMatterReference,
  isTrustAccountCode,
  validateReferenceNumber,
  type ReferenceValidationOptions,
} from "./reference-validator";
