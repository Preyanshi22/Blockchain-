# Dual-Fingerprint Approach

VeriTrace employs a dual-fingerprint strategy for content provenance, combining cryptographic hashing with perceptual hashing to cover the full spectrum of content duplication — from exact byte-level copies to visually similar forgeries.

## SHA-256: Cryptographic Exact-Match Detection

SHA-256 is a cryptographic hash function that produces a fixed 256-bit digest from any input. The critical property for VeriTrace is collision resistance: if two files produce the same SHA-256 hash, they are byte-for-byte identical. There is no practical possibility of two different files sharing a hash. This makes SHA-256 the definitive test for exact duplication. A single flipped bit, a changed metadata field, or even a re-encoding of the same visual content will produce a completely different SHA-256 digest. The comparison is binary — either two files match exactly, or they do not.

## Perceptual Hashing (pHash): Visual Similarity Detection

Perceptual hashing operates on an entirely different principle. Instead of hashing raw bytes, pHash reduces an image or video frame to a compact feature vector that captures the visual structure of the content — its dominant frequencies, spatial layout, and tonal distribution. Two visually similar images, such as a re-encoded JPEG and the original PNG, will produce similar pHash values even though their underlying byte representations (and therefore their SHA-256 hashes) are completely different. pHash is deliberately tolerant of format conversions, compression artifacts, minor crops, and resolution changes. Similarity between two pHash values is measured by Hamming distance — the number of differing bits between the two hashes.

## Why Both Are Necessary

Neither technique alone is sufficient. SHA-256 is fast and definitive but blind to visual similarity — it will miss a re-encoded copy entirely. pHash catches visual near-duplicates but is computationally more expensive and cannot guarantee byte-level identity. VeriTrace runs both in sequence: SHA-256 catches exact copies instantly and cheaply, while pHash catches the near-duplicates and visually-similar forgeries that slip past cryptographic comparison. The dual approach ensures comprehensive coverage. Exact copies are identified at minimal cost, and modified or re-encoded content is surfaced through perceptual comparison. Nothing slips through the gap between the two techniques.
