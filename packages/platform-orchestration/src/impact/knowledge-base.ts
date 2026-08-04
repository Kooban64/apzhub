/**
 * Provider-neutral quality asset knowledge base for correlation (QO-005).
 * Stores assets and relationships only — never executes capabilities.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  QUALITY_ASSET_TYPES,
  type AssetRelationship,
  type QualityAsset,
  type QualityAssetType,
} from "../contracts/impact-correlation";

export class ImpactKnowledgeBase {
  private readonly assets = new Map<string, QualityAsset>();
  private readonly relationships = new Map<string, AssetRelationship>();
  /** Adjacency: fromAssetId → relationshipIds */
  private readonly outgoing = new Map<string, string[]>();

  registerAsset(input: QualityAsset): QualityAsset {
    const assetId = input.assetId.trim();
    const name = input.name.trim();
    if (!assetId || !name) {
      throw new OrchestrationError(
        "validation",
        "INVALID_QUALITY_ASSET",
        "assetId and name are required",
      );
    }
    if (!(QUALITY_ASSET_TYPES as readonly string[]).includes(input.assetType)) {
      throw new OrchestrationError(
        "validation",
        "INVALID_ASSET_TYPE",
        `Unsupported quality asset type: ${input.assetType}`,
        { assetType: input.assetType },
      );
    }
    if (this.assets.has(assetId)) {
      throw new OrchestrationError(
        "validation",
        "ASSET_EXISTS",
        `Quality asset already registered: ${assetId}`,
        { assetId },
      );
    }

    const asset: QualityAsset = Object.freeze({
      assetId,
      assetType: input.assetType,
      name,
      version: input.version?.trim() || undefined,
      tenantId: input.tenantId?.trim() || undefined,
      projectId: input.projectId?.trim() || undefined,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      evidenceQuality: clamp01(input.evidenceQuality ?? 0.5),
      knownRegression: Boolean(input.knownRegression),
    });
    this.assets.set(assetId, asset);
    return asset;
  }

  registerRelationship(input: AssetRelationship): AssetRelationship {
    const relationshipId = input.relationshipId.trim();
    const fromAssetId = input.fromAssetId.trim();
    const toAssetId = input.toAssetId.trim();
    const reason = input.reason.trim();

    if (!relationshipId || !fromAssetId || !toAssetId || !reason) {
      throw new OrchestrationError(
        "validation",
        "INVALID_RELATIONSHIP",
        "relationshipId, fromAssetId, toAssetId, and reason are required",
      );
    }
    if (!this.assets.has(fromAssetId) || !this.assets.has(toAssetId)) {
      throw new OrchestrationError(
        "validation",
        "RELATIONSHIP_ASSET_MISSING",
        "Both relationship endpoints must be registered assets",
        { fromAssetId, toAssetId },
      );
    }
    if (this.relationships.has(relationshipId)) {
      throw new OrchestrationError(
        "validation",
        "RELATIONSHIP_EXISTS",
        `Relationship already registered: ${relationshipId}`,
        { relationshipId },
      );
    }

    const rel: AssetRelationship = Object.freeze({
      relationshipId,
      fromAssetId,
      toAssetId,
      kind: input.kind,
      strength: clamp01(input.strength),
      reason,
      evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    });
    this.relationships.set(relationshipId, rel);
    const list = this.outgoing.get(fromAssetId) ?? [];
    list.push(relationshipId);
    this.outgoing.set(fromAssetId, list);
    return rel;
  }

  getAsset(assetId: string): QualityAsset {
    const asset = this.assets.get(assetId.trim());
    if (!asset) {
      throw new OrchestrationError(
        "validation",
        "ASSET_MISSING",
        `Quality asset not found: ${assetId}`,
        { assetId },
      );
    }
    return asset;
  }

  tryGetAsset(assetId: string): QualityAsset | undefined {
    return this.assets.get(assetId.trim());
  }

  listAssets(filter?: {
    readonly assetType?: QualityAssetType;
  }): readonly QualityAsset[] {
    const all = [...this.assets.values()];
    if (!filter?.assetType) return all;
    return all.filter((a) => a.assetType === filter.assetType);
  }

  listRelationships(): readonly AssetRelationship[] {
    return [...this.relationships.values()];
  }

  outgoingRelationships(assetId: string): readonly AssetRelationship[] {
    const ids = this.outgoing.get(assetId.trim()) ?? [];
    return ids.map((id) => this.relationships.get(id)!);
  }

  assetCount(): number {
    return this.assets.size;
  }

  edgeCount(): number {
    return this.relationships.size;
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
