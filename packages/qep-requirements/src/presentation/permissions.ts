/** Permission catalogue — canonical definitions live in @apzhub/qep-contracts. */
export {
  QEP_REQUIREMENTS_PERMISSIONS,
  type QepRequirementsPermission,
} from "@apzhub/qep-contracts";

export const QEP_REQUIREMENTS_PERMISSION_LABELS: Record<
  import("@apzhub/qep-contracts").QepRequirementsPermission,
  string
> = {
  "qep.requirements.view": "View Requirements",
  "qep.requirements.create": "Create Requirements",
  "qep.requirements.edit": "Edit Requirements",
  "qep.requirements.delete": "Delete Requirements",
  "qep.requirements.submit": "Submit Requirements",
  "qep.requirements.review": "Review Requirements",
  "qep.requirements.approve": "Approve Requirements",
  "qep.requirements.reject": "Reject Requirements",
  "qep.requirements.implement": "Mark Requirements Implemented",
  "qep.requirements.verify": "Mark Requirements Verified",
  "qep.requirements.deprecate": "Deprecate Requirements",
  "qep.requirements.archive": "Archive Requirements",
  "qep.requirements.baseline": "Baseline Requirements",
  "qep.requirements.export": "Export Requirements",
  "qep.requirements.import": "Import Requirements",
  "qep.requirements.versions.history": "View Requirement Version History",
  "qep.requirements.versions.view": "View Requirement Content Version Detail",
  "qep.requirements.versions.compare": "Compare Requirement Content Versions",
  "qep.requirements.versions.verify": "Verify Requirement Version Integrity",
  "qep.requirements.baselines.view": "View Requirement Baselines",
  "qep.requirements.baselines.create": "Create Requirement Baselines",
  "qep.requirements.baselines.modify": "Modify Draft Requirement Baselines",
  "qep.requirements.baselines.lock": "Lock Requirement Baselines",
  "qep.requirements.baselines.archive": "Archive Requirement Baselines",
  "qep.requirements.baselines.compare": "Compare Requirement Baselines",
  "qep.requirements.baselines.verify": "Verify Requirement Baseline Integrity",
  "qep.requirements.relationships.view": "View Requirement Relationships",
  "qep.requirements.relationships.create": "Create Requirement Relationships",
  "qep.requirements.relationships.modify": "Modify Requirement Relationships",
  "qep.requirements.relationships.transition": "Transition Requirement Relationships",
  "qep.requirements.relationships.retire": "Retire Requirement Relationships",
  "qep.requirements.relationships.taxonomy.administer":
    "Administer Requirement Relationship Taxonomy",
};
