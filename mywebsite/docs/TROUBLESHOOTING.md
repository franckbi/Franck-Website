# Troubleshooting Guide

This guide covers common issues you might encounter while developing or using the 3D Portfolio Website, along with their solutions.

## 🚀 Quick Fixes

### Development Server Won't Start

```bash
# Clear Next.js cache and reinstall dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### 3D Content Not Loading

1. Check browser console for WebGL errors
2. Try enabling low-power mode toggle
3. Verify your browser supports WebGL at https://get.webgl.org/
4. Clear browser cache and reload

### Build Failures

```bash
# Type check first
npm run type-check

# Fix linting issues
npm run lint:fix

# Clean build
rm -rf .next
npm run build
```

## 🎨 3D Rendering Issues

### WebGL Context Lost

**Symptoms:** 3D scene disappears, console shows "WebGL context lost"

**Causes:**

- GPU driver crash or reset
- Browser tab backgrounded for too long
- Memory pressure on mobile devices
- Hardware acceleration disabled

**Solutions:**

1. **Immediate Fix:**

   ```javascript
   // The app automatically handles context loss, but you can manually refresh
   window.location.reload();
   ```

2. **Prevention:**
   - Enable hardware acceleration in browser settings
   - Close other GPU-intensive tabs
   - Update graphics drivers
   - Use low-power mode on battery

3. **For Developers:**
   ```typescript
   // Context loss is handled in WebGLErrorBoundary
   // Check components/3d/webgl-error-boundary.tsx
   ```

### 3D Models Not Loading

**Symptoms:** Empty 3D scene, loading spinner stuck

**Debugging Steps:**

1. **Check Network Tab:**
   - Are model files (`.glb`) loading?
   - Any 404 or network errors?
   - Check file sizes (should be < 500KB each)

2. **Check Console:**

   ```
   Look for errors like:
   - "Failed to load model"
   - "Draco decoder error"
   - "Invalid glTF file"
   ```

3. **Verify Asset Files:**

   ```bash
   # Check if model files exist
   ls -la public/models/

   # Validate glTF files
   npx gltf-validator public/models/your-model.glb
   ```

**Solutions:**

- **Missing Files:** Ensure all model files are in `public/models/`
- **Corrupted Files:** Re-export from Blender using the asset pipeline
- **Large Files:** Compress models using Draco compression
- **Network Issues:** Check CDN or hosting configuration

### Poor 3D Performance

**Symptoms:** Low FPS, stuttering, high memory usage

**Performance Checklist:**

1. **Check Device Capabilities:**

   ```javascript
   // Open browser console and run:
   console.log(navigator.hardwareConcurrency); // CPU cores
   console.log(navigator.deviceMemory); // RAM (if available)
   ```

2. **Monitor Performance:**
   - Enable performance monitor in dev tools
   - Check FPS counter in 3D scene
   - Monitor memory usage

3. **Optimization Steps:**
   - Enable low-power mode
   - Close other browser tabs
   - Reduce browser zoom level
   - Update graphics drivers

**For Developers:**

```typescript
// Check performance metrics
const stats = usePerformanceMonitor();
console.log('FPS:', stats.fps);
console.log('Memory:', stats.memoryUsage);
```

### Textures Not Loading

**Symptoms:** 3D models appear gray or untextured

**Common Causes:**

1. **Missing Texture Files:**

   ```bash
   # Check texture directory
   ls -la public/textures/
   ```

2. **CORS Issues:**
   - Textures must be served from same domain
   - Check network tab for CORS errors

3. **Format Issues:**
   - Ensure textures are in supported formats (PNG, JPG, WebP)
   - Check if KTX2 textures are properly generated

**Solutions:**

```bash
# Regenerate textures
npm run optimize-assets

# Check texture formats
file public/textures/*.{png,jpg,webp,ktx2}
```

## 🌐 Browser Compatibility Issues

### Safari-Specific Issues

**Common Problems:**

- WebGL context creation failures
- Audio autoplay restrictions
- iOS viewport scaling issues

**Solutions:**

1. **WebGL Issues:**

   ```javascript
   // Check Safari WebGL support
   const canvas = document.createElement('canvas');
   const gl = canvas.getContext('webgl');
   console.log('WebGL supported:', !!gl);
   ```

2. **iOS Viewport:**
   ```css
   /* Already handled in globals.css */
   html {
     -webkit-text-size-adjust: 100%;
   }
   ```

### Firefox-Specific Issues

**Common Problems:**

- WebGL performance differences
- Different WebGL extension support

**Solutions:**

- Check WebGL extensions: `about:support` → Graphics
- Enable hardware acceleration in preferences
- Update to latest Firefox version

### Mobile Browser Issues

**Common Problems:**

- Touch event conflicts
- Memory limitations
- Battery optimization interference

**Solutions:**

1. **Touch Events:**

   ```typescript
   // Touch handling is implemented in 3D components
   // Check components/3d/hero-scene.tsx
   ```

2. **Memory Management:**
   - Automatic low-power mode on mobile
   - Reduced texture quality
   - Geometry simplification

## 📱 Mobile-Specific Issues

### iOS Safari Problems

**Issue:** 3D content not loading on iPhone/iPad

**Debugging:**

1. Connect device to Mac and use Safari Web Inspector
2. Check console for WebGL errors
3. Test in different orientations

**Solutions:**

- Ensure iOS 12+ for WebGL 2.0 support
- Check available memory (Settings → General → iPhone Storage)
- Close background apps
- Restart Safari

### Android Chrome Issues

**Issue:** Poor performance or crashes

**Solutions:**

1. **Enable GPU Acceleration:**
   - Chrome → Settings → Advanced → System
   - Enable "Use hardware acceleration when available"

2. **Clear Chrome Data:**
   - Settings → Privacy → Clear browsing data
   - Include cached images and files

3. **Check Device Specs:**
   - Minimum: 2GB RAM, OpenGL ES 3.0
   - Recommended: 4GB+ RAM, Adreno 530+ or equivalent

## 🔧 Development Issues

### TypeScript Errors

**Common Errors:**

1. **Three.js Type Issues:**

   ```typescript
   // Error: Property 'material' does not exist on type 'Object3D'
   // Solution: Type assertion
   const mesh = object as THREE.Mesh;
   if (mesh.isMesh) {
     mesh.material.dispose();
   }
   ```

2. **React Three Fiber Types:**
   ```typescript
   // Error: JSX element type does not have any construct signatures
   // Solution: Import proper types
   import { extend } from '@react-three/fiber';
   import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
   extend({ OrbitControls });
   ```

### Build Errors

**Common Build Issues:**

1. **Bundle Size Exceeded:**

   ```bash
   # Check bundle size
   npm run analyze

   # Reduce bundle size
   npm run check-bundle
   ```

2. **Memory Issues During Build:**

   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

3. **Asset Optimization Failures:**

   ```bash
   # Check asset processing
   npm run optimize-assets

   # Validate processed assets
   npm run validate-assets
   ```

### Testing Issues

**Common Test Problems:**

1. **3D Component Tests Failing:**

   ```typescript
   // Mock Three.js in tests
   jest.mock('three', () => ({
     WebGLRenderer: jest.fn(),
     Scene: jest.fn(),
     PerspectiveCamera: jest.fn(),
   }));
   ```

2. **E2E Tests Timing Out:**
   ```typescript
   // Increase timeout for 3D loading
   test('3D scene loads', async ({ page }) => {
     await page.goto('/');
     await page.waitForSelector('[data-testid="3d-scene"]', {
       timeout: 10000,
     });
   });
   ```

## 🚀 Performance Optimization

### Bundle Size Issues

**Problem:** JavaScript bundle too large

**Analysis:**

```bash
# Analyze bundle composition
npm run analyze

# Check specific chunks
npx webpack-bundle-analyzer .next/static/chunks/
```

**Solutions:**

1. **Dynamic Imports:**

   ```typescript
   // Lazy load 3D components
   const Scene3D = lazy(() => import('./Scene3D'));
   ```

2. **Tree Shaking:**
   ```typescript
   // Import only what you need
   import { Vector3 } from 'three/src/math/Vector3';
   // Instead of: import * as THREE from 'three';
   ```

### Memory Leaks

**Symptoms:** Memory usage increases over time, browser becomes slow

**Debugging:**

1. **Chrome DevTools:**
   - Performance tab → Memory
   - Take heap snapshots
   - Look for detached DOM nodes

2. **Three.js Memory:**
   ```typescript
   // Check Three.js memory usage
   console.log(renderer.info.memory);
   ```

**Solutions:**

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, [geometry, material, texture]);
```

## 🔍 Debugging Tools

### Browser DevTools

**Chrome DevTools:**

- **Performance:** Profile 3D rendering performance
- **Memory:** Track memory usage and leaks
- **Network:** Monitor asset loading
- **Console:** Check for JavaScript errors

**Firefox DevTools:**

- **3D View:** Inspect DOM structure
- **Performance:** WebGL profiling
- **Network:** Asset loading analysis

### Three.js Debugging

```typescript
// Enable Three.js debugging
import { WebGLRenderer } from 'three';

const renderer = new WebGLRenderer({
  antialias: true,
  // Enable debugging
  debug: {
    checkShaderErrors: true,
    onShaderError: (gl, program, vs, fs) => {
      console.error('Shader error:', { vs, fs });
    },
  },
});

// Log renderer info
console.log('Renderer info:', renderer.info);
```

### Performance Monitoring

```typescript
// Built-in performance monitoring
import { usePerformanceMonitor } from '@/components/3d/performance-monitor';

const Component = () => {
  const { fps, memory, gpu } = usePerformanceMonitor();

  console.log(`FPS: ${fps}, Memory: ${memory}MB, GPU: ${gpu}%`);
};
```

## 📞 Getting Help

### Before Asking for Help

1. **Check Console:** Look for error messages
2. **Try Incognito:** Test in private browsing mode
3. **Test Different Browser:** Try Chrome, Firefox, Safari
4. **Check Network:** Ensure stable internet connection
5. **Update Browser:** Use latest browser version

### Information to Include

When reporting issues, please provide:

**Environment:**

- Operating System and version
- Browser and version
- Device type (desktop/mobile/tablet)
- Screen resolution
- Available RAM

**Error Details:**

- Console error messages
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings

**Performance Info:**

```javascript
// Run in browser console and include output
console.log({
  userAgent: navigator.userAgent,
  hardwareConcurrency: navigator.hardwareConcurrency,
  deviceMemory: navigator.deviceMemory,
  webgl: !!document.createElement('canvas').getContext('webgl'),
  webgl2: !!document.createElement('canvas').getContext('webgl2'),
});
```

### Community Resources

- **GitHub Issues:** Report bugs and feature requests
- **Discussions:** Ask questions and share ideas
- **Documentation:** Check docs/ directory for detailed guides
- **Examples:** Look at existing components for patterns

## 🔄 Recovery Procedures

### Complete Reset

If all else fails, try a complete reset:

```bash
# 1. Clear all caches
rm -rf .next node_modules package-lock.json

# 2. Clear browser data
# Chrome: Settings → Privacy → Clear browsing data
# Firefox: Settings → Privacy → Clear Data

# 3. Reinstall dependencies
npm install

# 4. Rebuild project
npm run build

# 5. Test in incognito mode
npm run dev
```

### Emergency Fallback

If 3D content is completely broken:

1. **Enable Low-Power Mode:**
   - Toggle in settings panel
   - Or add `?lowpower=true` to URL

2. **Disable JavaScript:**
   - Site still works with semantic HTML
   - Basic navigation and content available

3. **Use Different Browser:**
   - Try Firefox if Chrome fails
   - Try Safari on macOS/iOS
   - Try Edge on Windows

Remember: The site is designed with progressive enhancement, so basic functionality should always work even if 3D features fail.

---

**Still having issues?** Please [create an issue](https://github.com/your-repo/issues) with detailed information about your problem.
