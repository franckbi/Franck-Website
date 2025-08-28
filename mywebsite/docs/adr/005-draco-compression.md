# ADR 005: Use Draco compression for 3D models

## Status

Accepted

## Context

3D models can be large files that significantly impact loading performance. The portfolio website needs to display multiple 3D project cards while maintaining fast load times and good user experience.

Options considered:

1. **Uncompressed glTF** - Standard format, larger file sizes
2. **Draco Compression** - Google's geometry compression
3. **Meshopt Compression** - Alternative compression algorithm
4. **Custom Binary Format** - Proprietary compression solution

Performance requirements:

- Initial 3D payload ≤ 1.2MB total
- Individual models ≤ 200KB compressed
- Decompression time ≤ 100ms on mid-range devices

## Decision

We will use Draco compression for all 3D models, with fallback to uncompressed glTF if Draco decoder fails.

## Consequences

### Positive

- **File Size Reduction** - 80-90% smaller geometry files
- **Bandwidth Savings** - Faster loading on slow connections
- **Storage Efficiency** - Reduced CDN and cache storage requirements
- **Industry Standard** - Widely supported compression format
- **Quality Preservation** - Lossless compression for geometry data

### Negative

- **Decode Time** - Additional CPU time for decompression
- **Browser Support** - Requires WebAssembly support
- **Complexity** - Additional build pipeline step
- **Debugging** - Harder to inspect compressed models
- **Memory Usage** - Temporary memory spike during decompression

### Implementation Details

- **Build Pipeline** - Automatic Draco compression during asset processing
- **Loader Strategy** - Progressive loading with Suspense integration
- **Error Handling** - Fallback to uncompressed models if Draco fails
- **Performance Monitoring** - Track decode times and success rates
- **Quality Settings** - Optimize quantization levels for visual quality vs size
