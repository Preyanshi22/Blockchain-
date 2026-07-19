# Perceptual Hashing vs. AI-Generated Content Detection

This document clarifies a critical distinction: VeriTrace's perceptual hashing (pHash) pipeline detects visually similar content. It does **not** detect whether content is AI-generated versus human-created. These are fundamentally different problems, and conflating them would misrepresent the system's capabilities.

## What pHash Actually Does

Perceptual hashing compares the visual structure of two pieces of content. It answers one question: *"Does this look like that?"* When VeriTrace computes a pHash and compares it against the index, it is measuring visual similarity — shared spatial frequencies, tonal patterns, and structural layout. If two images are visually similar, their pHash values will be close (low Hamming distance), regardless of how either image was created.

This means pHash will happily match an AI-generated image against a registered original if they look visually similar. It will also match two AI-generated images against each other, or two photographs, or a photograph against a painting, as long as the visual structure is sufficiently similar. The provenance of the content — whether it was captured by a camera, drawn by hand, or synthesized by a generative model — is invisible to perceptual hashing.

## What AI Detection Requires

Detecting whether content is AI-generated is an entirely separate problem that requires different techniques:

- **Statistical artifact analysis** — identifying patterns in pixel distributions, frequency spectra, or noise characteristics that are signatures of specific generative architectures (GANs, diffusion models, autoregressive transformers).
- **Metadata inspection** — examining EXIF data, embedded watermarks, or C2PA provenance manifests that may indicate synthetic origin.
- **Watermark detection** — identifying invisible watermarks embedded by generation tools (e.g., those used by DALL-E, Stable Diffusion with certain configurations, or Imagen).
- **Model fingerprinting** — matching subtle generative artifacts to known model families or specific model versions.

None of these techniques are part of VeriTrace's pipeline. VeriTrace does not perform statistical analysis of generation artifacts, does not inspect for AI watermarks, and does not attempt to classify content as real or synthetic.

## Why This Distinction Matters

The VeriTrace bot should never claim or imply that the system can detect AI-generated content. Doing so would be a misrepresentation of capabilities that could erode user trust and lead to incorrect conclusions. When users ask whether content is AI-generated, the correct response is to explain that VeriTrace verifies content provenance through similarity matching — it can tell you whether content matches or resembles something previously registered, but it cannot tell you whether content was created by a human or a machine.
