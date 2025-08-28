---
name: Performance issue
about: Report performance problems or optimization opportunities
title: '[PERFORMANCE] '
labels: 'performance'
assignees: ''
---

## ⚡ Performance Issue Summary

A clear and concise description of the performance problem.

## 📊 Performance Metrics

**Current Performance:**

- Page Load Time: [e.g., 5.2 seconds]
- First Contentful Paint (FCP): [e.g., 2.1 seconds]
- Largest Contentful Paint (LCP): [e.g., 4.8 seconds]
- Time to Interactive (TTI): [e.g., 6.1 seconds]
- Cumulative Layout Shift (CLS): [e.g., 0.15]
- First Input Delay (FID): [e.g., 150ms]

**3D Performance (if applicable):**

- Frame Rate: [e.g., 15 FPS]
- Memory Usage: [e.g., 250MB]
- GPU Utilization: [e.g., 85%]
- Asset Load Time: [e.g., 8 seconds]

**Expected Performance:**

- Target metrics or benchmarks
- Performance budget requirements

## 🔍 How to Reproduce

**Steps to reproduce the performance issue:**

1. Go to '...'
2. Perform action '...'
3. Observe performance metrics
4. Note the specific performance problem

**Test Conditions:**

- Network: [e.g., 4G, WiFi, Slow 3G]
- Device: [e.g., iPhone 12, MacBook Pro M1, Samsung Galaxy S21]
- Browser: [e.g., Chrome 118, Safari 17, Firefox 119]

## 🌐 Environment Details

**Device Information:**

- Device Type: [Desktop/Mobile/Tablet]
- CPU: [e.g., Apple M2, Intel i7-12700K, Snapdragon 888]
- RAM: [e.g., 16GB, 8GB, 4GB]
- GPU: [e.g., NVIDIA RTX 3080, Intel Iris Xe, Adreno 660]

**Browser Information:**

- Browser: [e.g., Chrome 118.0.5993.88]
- WebGL Version: [Check at https://get.webgl.org/]
- Hardware Acceleration: [Enabled/Disabled]
- Extensions: [List relevant extensions]

**Network Information:**

- Connection Type: [WiFi/4G/5G/Ethernet]
- Speed: [e.g., 50 Mbps down, 10 Mbps up]
- Latency: [e.g., 20ms]

## 📈 Performance Analysis

**Profiling Data:**

- Chrome DevTools Performance tab results
- Lighthouse audit scores
- Bundle analyzer results
- Memory usage patterns

**Suspected Causes:**

- [ ] Large JavaScript bundles
- [ ] Unoptimized images
- [ ] Heavy 3D assets
- [ ] Memory leaks
- [ ] Inefficient rendering
- [ ] Network bottlenecks
- [ ] Blocking resources

## 🎯 Impact Assessment

**User Impact:**

- Affected user percentage: [e.g., 25% of mobile users]
- User experience degradation: [Describe impact]
- Business impact: [e.g., increased bounce rate]

**Performance Budget Impact:**

- Which budgets are exceeded?
- By how much?
- Trend over time?

## 🔧 Potential Solutions

**Optimization Ideas:**

- [ ] Code splitting improvements
- [ ] Asset optimization (images, 3D models)
- [ ] Lazy loading implementation
- [ ] Caching strategy improvements
- [ ] Bundle size reduction
- [ ] 3D scene optimization
- [ ] Memory management improvements

**Technical Approaches:**

- Specific optimization techniques
- Library or tool recommendations
- Architecture changes needed

## 📊 Testing Methodology

**How was this performance issue identified?**

- [ ] Lighthouse audit
- [ ] Real User Monitoring (RUM)
- [ ] Synthetic testing
- [ ] User reports
- [ ] Manual testing

**Performance Testing Tools Used:**

- [ ] Chrome DevTools
- [ ] Lighthouse
- [ ] WebPageTest
- [ ] Bundle Analyzer
- [ ] Three.js Inspector

## 🎯 Success Criteria

**Performance Targets:**

- Target FCP: [e.g., < 1.5s]
- Target LCP: [e.g., < 2.5s]
- Target TTI: [e.g., < 3.0s]
- Target CLS: [e.g., < 0.1]
- Target FPS: [e.g., > 30 FPS]
- Target Bundle Size: [e.g., < 180KB gzipped]

## 📱 Device-Specific Issues

**Mobile Performance:**

- Touch responsiveness issues
- Battery drain concerns
- Thermal throttling effects
- Network usage patterns

**Desktop Performance:**

- High-end vs low-end hardware
- Multi-monitor setups
- Background application impact

## 🔗 Related Information

**Links:**

- Performance audit reports
- Related issues or PRs
- Relevant documentation
- External benchmarks or studies

**Screenshots/Videos:**

- Performance timeline screenshots
- Flame graphs
- Network waterfall charts
- Visual comparison videos

## 📋 Additional Context

**When did this performance issue start?**

- Recent regression or long-standing issue?
- Related to specific changes or deployments?
- Seasonal or usage pattern related?

**Workarounds:**

- Any temporary solutions users can apply?
- Settings that improve performance?

## ✅ Checklist

- [ ] I have provided specific performance metrics
- [ ] I have tested on multiple devices/browsers
- [ ] I have used performance profiling tools
- [ ] I have checked for existing performance issues
- [ ] I have considered the impact on different user groups
- [ ] I have suggested potential optimization approaches
