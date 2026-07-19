# Dedup-First Pipeline Architecture

VeriTrace uses a dedup-first architecture that prioritizes cheap exact-match detection before engaging the more expensive perceptual hashing pipeline. This gating strategy is the single most important performance optimization in the content verification flow.

## Stage 1: SHA-256 Deduplication

When new content is submitted for registration or verification, the first operation is always a SHA-256 hash computation and lookup against the unified cross-media index. This is an O(1) hash table lookup — the system computes the SHA-256 digest of the incoming content and checks whether that exact digest already exists in the index. If a match is found, the content is immediately flagged as an exact duplicate. The system returns the matching record's metadata (original content ID, registration timestamp, owner) and no further processing occurs. The entire operation completes in microseconds for the lookup itself, plus the time to compute the SHA-256 digest (which is fast even for large files, since SHA-256 is hardware-accelerated on modern CPUs).

## Stage 2: Perceptual Hashing (Conditional)

Only content that passes the SHA-256 deduplication check — meaning no exact byte-level duplicate exists — proceeds to the perceptual hashing pipeline. This stage is substantially more expensive. It involves decoding the image or video into raw pixel data, applying the perceptual hash algorithm to extract a compact feature vector, and then comparing that vector against every entry in the pHash index using Hamming distance calculations. For video content, multiple frames must be decoded and hashed individually. The computational cost of this stage is orders of magnitude higher than a hash table lookup.

## Why Gating Matters

The dedup-first design exists because a significant fraction of duplicate content submissions are exact copies — the same file uploaded multiple times, shared without modification, or mirrored across platforms. By rejecting these at the SHA-256 stage, VeriTrace avoids running the expensive perceptual pipeline on content that would have been caught anyway. This dramatically reduces average processing latency and compute costs. In a high-throughput environment, the savings compound: every exact duplicate that is short-circuited at Stage 1 frees compute resources for the perceptual analysis of genuinely novel content that actually requires it.
