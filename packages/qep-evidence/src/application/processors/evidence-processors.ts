/**
 * Evidence business processors — APZQEP-120-S10.
 * One registration per Owner-required processor; capabilities bind catalogue events.
 */

import { QEP_EVIDENCE_PLATFORM_EVENTS } from "../events/catalogue";
import { createEvidenceEventProcessor } from "./create-evidence-processor";
import type {
  EvidenceBusinessActionPort,
  EvidenceProcessorRegistration,
} from "./types";

export function createEvidenceCreatedProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.created.handle",
    metadata: {
      processorId: "qep.evidence.processor.created",
      name: "Evidence Created Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.created],
      replayCompatible: true,
      description: "Handles evidence creation business reactions.",
    },
  });
}

export function createEvidenceUpdatedProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.updated.handle",
    metadata: {
      processorId: "qep.evidence.processor.updated",
      name: "Evidence Updated Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.updated],
      replayCompatible: true,
      description: "Handles evidence update business reactions.",
    },
  });
}

export function createEvidenceLifecycleProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.lifecycle.handle",
    metadata: {
      processorId: "qep.evidence.processor.lifecycle",
      name: "Evidence Lifecycle Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged],
      replayCompatible: true,
      description: "Handles lifecycle governance business reactions.",
    },
  });
}

export function createEvidenceIntegrityProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.integrity.handle",
    metadata: {
      processorId: "qep.evidence.processor.integrity",
      name: "Evidence Integrity Processor",
      version: "1.0.0",
      eventTypes: [
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
        QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
      ],
      replayCompatible: true,
      description: "Handles integrity established and verified business reactions.",
    },
  });
}

export function createEvidenceArchiveProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.archived.handle",
    metadata: {
      processorId: "qep.evidence.processor.archive",
      name: "Evidence Archive Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.archived],
      replayCompatible: true,
      description: "Handles evidence archive business reactions.",
    },
  });
}

export function createEvidenceSupersessionProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.superseded.handle",
    metadata: {
      processorId: "qep.evidence.processor.supersession",
      name: "Evidence Supersession Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.superseded],
      replayCompatible: true,
      description: "Handles evidence supersession business reactions.",
    },
  });
}

export function createEvidenceDeleteProcessor(
  business: EvidenceBusinessActionPort,
): EvidenceProcessorRegistration {
  return createEvidenceEventProcessor({
    business,
    action: "evidence.deleted.handle",
    metadata: {
      processorId: "qep.evidence.processor.delete",
      name: "Evidence Delete Processor",
      version: "1.0.0",
      eventTypes: [QEP_EVIDENCE_PLATFORM_EVENTS.deleted],
      replayCompatible: true,
      description: "Handles evidence deletion business reactions.",
    },
  });
}

/** Deterministic factory for the full Evidence processor set. */
export function createAllEvidenceProcessors(
  business: EvidenceBusinessActionPort,
): readonly EvidenceProcessorRegistration[] {
  return [
    createEvidenceCreatedProcessor(business),
    createEvidenceUpdatedProcessor(business),
    createEvidenceLifecycleProcessor(business),
    createEvidenceIntegrityProcessor(business),
    createEvidenceArchiveProcessor(business),
    createEvidenceSupersessionProcessor(business),
    createEvidenceDeleteProcessor(business),
  ];
}
