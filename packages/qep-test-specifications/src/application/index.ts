export {
  createSpecificationApplicationService,
  type SpecificationApplicationService,
  type SpecificationApplicationServiceDeps,
  type SpecificationAuditEntry,
  type SpecificationAuditAppender,
  type SpecificationObservationEvent,
  type CreateSpecificationCommandInput,
  type UpdateSpecificationDraftCommandInput,
  type SubmitSpecificationReviewCommandInput,
  type ApproveSpecificationCommandInput,
  type RejectSpecificationCommandInput,
  type SupersedeSpecificationCommandInput,
  type AddSpecificationRelationshipCommandInput,
  type SpecificationListCommandQuery,
} from "./services/specification-application-service";

export { computeSpecificationAvailableActions } from "./available-actions";

export { toSpecificationDto } from "./adapters/specification-dto-adapter";
