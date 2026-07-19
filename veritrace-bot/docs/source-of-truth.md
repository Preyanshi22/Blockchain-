# Source of Truth: Blockchain-Anchored JSON

VeriTrace's canonical data store is a blockchain-anchored JSON file maintained by the Rust (actix-web) backend. This file is the single, authoritative record of all content registrations, verification events, and provenance records in the system.

## The Canonical Store

Every write operation in VeriTrace — registering new content, recording a verification event, updating provenance metadata — is committed to the blockchain JSON file. The file's integrity is guaranteed by blockchain anchoring: its state is periodically hashed and anchored to the blockchain, creating an immutable audit trail that makes retroactive tampering detectable. If anyone modifies the JSON file without going through the proper registration flow, the anchored hashes will no longer match, and the tampering is evident.

This file is not merely a log or a cache. It is the system's ground truth. Any question about what content is registered, when it was registered, and who registered it is answered definitively by the blockchain JSON.

## Derived Indexes Are Secondary

Other data stores in the VeriTrace architecture exist purely as performance optimizations. The most notable is the SQLite database used as a pHash side-index. This database provides fast perceptual hash lookups — it allows the system to quickly find all registered items within a given Hamming distance of a query hash without scanning the entire blockchain JSON file sequentially.

However, the SQLite index is derived data. It is populated from the blockchain JSON and can be completely rebuilt from it at any time. It does not contain any information that is not already present in the canonical store. The same principle applies to any future caches, search indexes, or materialized views that may be added to the system.

## Conflict Resolution

If there is ever a discrepancy between the SQLite side-index (or any other derived store) and the blockchain JSON, the blockchain JSON wins unconditionally. The derived store is considered stale or corrupted, and the correct remediation is to rebuild it from the canonical source. No query result should ever contradict what is recorded in the blockchain file.

## Recovery and Resilience

This architecture provides a strong recovery guarantee. If the SQLite index becomes corrupted — due to a crash, a bug, or disk errors — the system can recover fully by re-indexing from the blockchain JSON. The canonical store is the only data that truly matters; everything else is a rebuildable acceleration layer. This separation of concerns keeps the system resilient without sacrificing query performance during normal operation.
