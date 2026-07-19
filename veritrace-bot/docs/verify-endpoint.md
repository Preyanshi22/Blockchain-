# The /verify Endpoint

The `/verify` endpoint is VeriTrace's primary query interface for content provenance checks. Given a content ID, it performs both exact-match and perceptual-similarity lookups and returns a structured JSON response covering both dimensions.

## Response Structure

The response always contains two top-level fields:

### `exact_match` (nullable object)

If the submitted content's SHA-256 hash exactly matches a previously registered item, this field contains that item's metadata:

- **content_id** — the unique identifier of the matching registered item.
- **registration_timestamp** — the ISO 8601 timestamp of when the matching item was originally registered.
- **owner** — the identity or account that registered the original content.

If no exact byte-level duplicate exists in the index, `exact_match` is `null`. There is no ambiguity: either the SHA-256 digest matches a registered item, or it does not.

### `similar_matches` (array)

This array contains all registered items whose perceptual hash (pHash) falls within the Hamming distance threshold of 40 relative to the submitted content's pHash. Entries are ranked by similarity percentage in descending order — the most visually similar item appears first. Each entry includes:

- **content_id** — the unique identifier of the perceptually similar registered item.
- **similarity_percentage** — a human-readable similarity score derived from the Hamming distance (lower distance = higher percentage).
- **hamming_distance** — the raw bit-difference count between the two perceptual hashes.
- **metadata** — the matched item's registration metadata (timestamp, owner, and any additional provenance fields).

An empty `similar_matches` array means no registered content is visually similar to the submitted item within the configured threshold.

## Interpretation Guidelines

The endpoint always returns both fields regardless of outcome. Several scenarios are worth noting:

- **Exact match exists, similar matches also present.** This is common — an exact duplicate will also be perceptually identical, and other visually similar content may exist independently. The `exact_match` field gives the definitive duplicate; `similar_matches` provides broader context.
- **No exact match, but similar matches found.** The content is not a byte-level copy of anything registered, but it visually resembles one or more registered items. This is the typical scenario for re-encoded, cropped, or lightly edited derivatives.
- **No exact match, empty similar matches.** The content is novel — it does not match or visually resemble any registered item. This is the expected result for genuinely original content.

The endpoint does not make a determination of authenticity or forgery. It reports matches and similarity scores; interpretation of those results is left to the consuming application or user.
