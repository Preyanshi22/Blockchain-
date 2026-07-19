# Perceptual Hash Matching Threshold

VeriTrace uses a Hamming distance threshold of 40 for perceptual hash comparisons. This threshold governs the boundary between content flagged as a potential match and content considered distinct.

## How Hamming Distance Works

Two perceptual hash values are compared bit-by-bit. The Hamming distance is simply the count of bit positions where the two hashes differ. A Hamming distance of 0 means the two perceptual fingerprints are identical — the content is visually indistinguishable at the level of structure captured by pHash. As the distance increases, the visual similarity decreases. Small distances (single digits) typically indicate trivial modifications: format conversions, slight compression changes, or minor metadata differences. Moderate distances (10–30) often correspond to more noticeable edits: crops, brightness adjustments, overlaid text, or watermark additions. Distances above the threshold indicate content that is visually distinct enough to be considered unrelated.

## Why 40?

The threshold of 40 was tuned empirically to balance two competing concerns:

- **Sensitivity** — the system must catch real forgeries, near-duplicates, re-encodings, crops, and visually-similar derivatives. A threshold that is too low would miss modified content that a human would clearly recognize as derived from the original.
- **Specificity** — the system must not flag genuinely different content as matching. A threshold that is too high would generate false positives, eroding trust in the verification results and overwhelming users with spurious match reports.

The value of 40 represents a calibrated trade-off. It is high enough to catch the transformations commonly applied to repurposed or forged content (re-encoding, cropping, resolution changes, format conversion, minor color adjustments) while remaining low enough to avoid matching content that merely shares a superficial visual resemblance.

## How Results Are Reported

The `/verify` endpoint returns all matches whose Hamming distance falls at or below the threshold of 40. Results are ranked by similarity percentage in descending order — lower Hamming distance translates to higher similarity. A Hamming distance of 0 corresponds to 100% perceptual similarity; a distance of 40 corresponds to the minimum similarity that still qualifies as a match. This ranking lets consumers of the API quickly identify the closest matches and assess the strength of each match relative to the threshold boundary.
