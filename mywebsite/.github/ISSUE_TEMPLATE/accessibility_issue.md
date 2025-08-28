---
name: Accessibility issue
about: Report accessibility barriers or compliance issues
title: '[A11Y] '
labels: 'accessibility'
assignees: ''
---

## ♿ Accessibility Issue Summary

A clear and concise description of the accessibility barrier or compliance issue.

## 🎯 WCAG Guidelines Affected

**WCAG 2.1 Level:** [A/AA/AAA]
**Specific Guidelines:**

- [ ] 1.1 Text Alternatives
- [ ] 1.2 Time-based Media
- [ ] 1.3 Adaptable
- [ ] 1.4 Distinguishable
- [ ] 2.1 Keyboard Accessible
- [ ] 2.2 Enough Time
- [ ] 2.3 Seizures and Physical Reactions
- [ ] 2.4 Navigable
- [ ] 2.5 Input Modalities
- [ ] 3.1 Readable
- [ ] 3.2 Predictable
- [ ] 3.3 Input Assistance
- [ ] 4.1 Compatible

**Success Criteria:** [e.g., 2.1.1 Keyboard, 1.4.3 Contrast (Minimum)]

## 🔍 How to Reproduce

**Steps to reproduce the accessibility issue:**

1. Navigate to '...'
2. Use [assistive technology/keyboard/etc.] to '...'
3. Attempt to '...'
4. Observe the barrier or issue

## 🛠️ Assistive Technology Testing

**Screen Readers:**

- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

**Browser/Screen Reader Combinations Tested:**

- [ ] Chrome + NVDA
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + NVDA

**Other Assistive Technologies:**

- [ ] Voice control software
- [ ] Switch navigation
- [ ] Eye tracking
- [ ] Magnification software

## ⌨️ Keyboard Navigation

**Keyboard Issues:**

- [ ] Cannot reach element with Tab key
- [ ] Focus indicator not visible
- [ ] Focus trap not working
- [ ] Incorrect tab order
- [ ] Missing keyboard shortcuts
- [ ] Cannot activate with Enter/Space

**Expected Keyboard Behavior:**
Describe how keyboard navigation should work for this element/feature.

## 🎨 Visual Accessibility

**Color and Contrast:**

- Current contrast ratio: [e.g., 2.1:1]
- Required contrast ratio: [e.g., 4.5:1 for AA]
- Color combinations affected: [e.g., blue text on gray background]

**Visual Issues:**

- [ ] Insufficient color contrast
- [ ] Information conveyed by color only
- [ ] Text too small
- [ ] Focus indicators unclear
- [ ] Animation/motion issues

## 🔊 Audio/Media Accessibility

**Media Issues:**

- [ ] Missing captions/subtitles
- [ ] Missing audio descriptions
- [ ] Auto-playing media
- [ ] No volume controls
- [ ] Inaccessible media controls

## 📱 Mobile Accessibility

**Touch Target Issues:**

- [ ] Touch targets too small (< 44px)
- [ ] Touch targets too close together
- [ ] Gestures not accessible
- [ ] Orientation lock issues

**Mobile Screen Reader Issues:**

- [ ] VoiceOver navigation problems
- [ ] TalkBack navigation problems
- [ ] Gesture conflicts

## 🎮 3D/Interactive Content Accessibility

**3D Scene Issues:**

- [ ] No alternative text for 3D content
- [ ] Cannot navigate 3D scene with keyboard
- [ ] No semantic equivalent for 3D interactions
- [ ] Motion/animation cannot be disabled
- [ ] WebGL content not accessible

**Interactive Element Issues:**

- [ ] Custom controls not accessible
- [ ] Missing ARIA labels
- [ ] Incorrect ARIA roles
- [ ] State changes not announced

## 🌐 Environment Details

**Browser:**

- Browser: [e.g., Chrome 118, Firefox 119, Safari 17]
- Operating System: [e.g., Windows 11, macOS 14, iOS 17]
- Assistive Technology: [e.g., NVDA 2023.2, VoiceOver]

**Settings:**

- High contrast mode: [Enabled/Disabled]
- Reduced motion: [Enabled/Disabled]
- Zoom level: [e.g., 200%]
- Font size: [e.g., Large]

## 📊 Impact Assessment

**User Impact:**

- Severity: [Critical/High/Medium/Low]
- User groups affected: [e.g., blind users, motor impaired users]
- Percentage of users potentially affected: [estimate]

**Compliance Impact:**

- Legal compliance risk: [High/Medium/Low]
- Certification requirements affected: [e.g., Section 508, EN 301 549]

## 💡 Suggested Solutions

**Immediate Fixes:**

- [ ] Add missing ARIA labels
- [ ] Improve color contrast
- [ ] Fix keyboard navigation
- [ ] Add alternative text

**Long-term Improvements:**

- [ ] Redesign for better accessibility
- [ ] Implement semantic alternatives for 3D content
- [ ] Add comprehensive keyboard shortcuts
- [ ] Improve screen reader experience

**Code Examples:**

```html
<!-- Current problematic code -->
<div onclick="handleClick()">Click me</div>

<!-- Suggested accessible code -->
<button type="button" aria-label="Open project details" onclick="handleClick()">
  Click me
</button>
```

## 🧪 Testing Tools Used

**Automated Testing:**

- [ ] axe-core
- [ ] WAVE
- [ ] Lighthouse accessibility audit
- [ ] Pa11y
- [ ] axe DevTools

**Manual Testing:**

- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast analyzer
- [ ] Zoom testing (up to 200%)

**Test Results:**
Include screenshots or reports from accessibility testing tools.

## 📚 Resources and References

**WCAG References:**

- [Link to specific WCAG success criteria]
- [Link to WCAG techniques]

**Best Practices:**

- [Link to accessibility best practices]
- [Link to ARIA authoring practices]

## 🔗 Related Issues

**Related Accessibility Issues:**

- Related to #[issue number]
- Blocks #[issue number]
- Part of accessibility audit #[issue number]

## 📋 Additional Context

**User Feedback:**
Include any feedback from users with disabilities who encountered this issue.

**Business Context:**

- Compliance deadlines
- Certification requirements
- User base considerations

## ✅ Checklist

- [ ] I have tested with multiple assistive technologies
- [ ] I have verified this against WCAG guidelines
- [ ] I have provided specific steps to reproduce
- [ ] I have suggested potential solutions
- [ ] I have considered the impact on different user groups
- [ ] I have used automated accessibility testing tools

## 🎯 Definition of Done

**Acceptance Criteria for Fix:**

- [ ] Issue passes automated accessibility tests
- [ ] Issue passes manual screen reader testing
- [ ] Issue passes keyboard navigation testing
- [ ] Issue meets WCAG 2.1 AA requirements
- [ ] Solution is tested across multiple browsers/AT combinations
