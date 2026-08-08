-- SUP-PR-02 / SUP-PR-04 — Allow Support canonical entity types on platform_entity_mapping.
-- Aligns CHECK with packages/platform-services mapping CanonicalEntityType.

ALTER TABLE "platform_entity_mapping"
  DROP CONSTRAINT IF EXISTS "platform_entity_mapping_entity_type_chk";

ALTER TABLE "platform_entity_mapping"
  ADD CONSTRAINT "platform_entity_mapping_entity_type_chk" CHECK (
    "entity_type" IN (
      'workspace', 'project', 'task', 'sprint', 'milestone', 'label',
      'status', 'module', 'member', 'team', 'user',
      'support_request', 'support_organization', 'support_group',
      'support_user', 'support_article'
    )
  );
