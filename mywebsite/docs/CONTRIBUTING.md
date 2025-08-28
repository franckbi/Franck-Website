# Contributing to 3D Portfolio Website

Thank you for your interest in contributing to the 3D Portfolio Website! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git for version control
- Basic knowledge of React, TypeScript, and Three.js

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/3d-portfolio-website.git
   cd 3d-portfolio-website
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Contribution Types

### Bug Reports

- Use the bug report template
- Include steps to reproduce
- Provide browser and device information
- Include screenshots or videos if applicable

### Feature Requests

- Use the feature request template
- Explain the use case and benefits
- Consider accessibility and performance implications
- Provide mockups or examples if helpful

### Code Contributions

- Follow the coding standards below
- Include tests for new functionality
- Update documentation as needed
- Ensure all checks pass

### Documentation

- Fix typos and improve clarity
- Add examples and use cases
- Update outdated information
- Translate content (if applicable)

## 🎨 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use meaningful variable and function names

```typescript
// ✅ Good
interface ProjectCard {
  id: string;
  title: string;
  position: [number, number, number];
}

// ❌ Bad
const data: any = {
  id: 'proj1',
  title: 'Project',
  pos: [0, 0, 0],
};
```

### React Components

- Use functional components with hooks
- Implement proper prop types
- Use meaningful component names
- Keep components focused and small

```typescript
// ✅ Good
interface HeroSceneProps {
  projects: Project[];
  onProjectSelect: (id: string) => void;
  lowPowerMode?: boolean;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  projects,
  onProjectSelect,
  lowPowerMode = false,
}) => {
  // Component implementation
};
```

### 3D Components

- Dispose of geometries and materials properly
- Use Suspense for loading states
- Implement error boundaries
- Consider performance implications

```typescript
// ✅ Good - Proper cleanup
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
  };
}, [geometry, material]);
```

### CSS and Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Ensure sufficient color contrast
- Support both light and dark themes

```css
/* ✅ Good - Responsive and accessible */
.project-card {
  @apply bg-white dark:bg-gray-800 
         border border-gray-200 dark:border-gray-700
         rounded-lg shadow-sm hover:shadow-md
         transition-shadow duration-200
         focus:outline-none focus:ring-2 focus:ring-blue-500;
}
```

## 🧪 Testing Requirements

### Unit Tests

- Write tests for all utility functions
- Test component behavior and props
- Mock external dependencies
- Aim for >80% code coverage

```typescript
// Example test structure
describe('ProjectCard', () => {
  it('should render project information correctly', () => {
    const mockProject = {
      id: 'test-project',
      title: 'Test Project',
      description: 'A test project'
    };

    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

### Integration Tests

- Test API endpoints
- Test data loading and error handling
- Test state management integration

### E2E Tests

- Test critical user journeys
- Include accessibility testing
- Test across different browsers
- Test mobile interactions

## ♿ Accessibility Guidelines

### Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper focus management
- Sufficient color contrast

### Implementation

- Use semantic HTML elements
- Provide ARIA labels for 3D interactions
- Implement skip links
- Test with screen readers
- Respect reduced motion preferences

```typescript
// ✅ Good - Accessible 3D interaction
<mesh
  onClick={handleClick}
  onPointerOver={handleHover}
  aria-label={`${project.title} project card`}
  role="button"
  tabIndex={0}
>
```

## 🚀 Performance Guidelines

### Bundle Size

- Keep JavaScript bundle ≤ 180KB (excluding Three.js)
- Use dynamic imports for large components
- Optimize images and 3D assets
- Monitor bundle size in CI/CD

### 3D Performance

- Maintain ≥30 FPS on mid-range mobile devices
- Use LOD (Level of Detail) for complex models
- Implement proper geometry disposal
- Monitor memory usage

### Loading Performance

- Implement progressive loading
- Use Suspense for loading states
- Optimize Critical Rendering Path
- Achieve Core Web Vitals targets

## 📋 Pull Request Process

### Before Submitting

1. **Run all tests**: `npm run test:all`
2. **Check linting**: `npm run lint`
3. **Format code**: `npm run format`
4. **Build successfully**: `npm run build`
5. **Test accessibility**: Manual testing with keyboard and screen reader

### PR Requirements

- [ ] Clear, descriptive title
- [ ] Detailed description of changes
- [ ] Link to related issue (if applicable)
- [ ] Screenshots/videos for UI changes
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Accessibility considerations addressed
- [ ] Performance impact assessed

### PR Template

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Screenshots/Videos

Include visual evidence of changes.

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. **Automated Checks**: All CI/CD checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing of changes
4. **Accessibility Review**: Accessibility impact assessment
5. **Performance Review**: Performance impact evaluation

## 🐛 Bug Report Guidelines

### Information to Include

- **Environment**: Browser, OS, device type
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots/Videos**: Visual evidence
- **Console Errors**: Any JavaScript errors
- **Additional Context**: Relevant details

### Bug Report Template

```markdown
**Environment**

- Browser: [e.g., Chrome 118]
- OS: [e.g., macOS 14.0]
- Device: [e.g., MacBook Pro, iPhone 14]

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Actual Behavior**
A clear description of what actually happened.

**Screenshots/Videos**
Add screenshots or videos to help explain the problem.

**Console Errors**
Include any JavaScript errors from the browser console.

**Additional Context**
Add any other context about the problem here.
```

## 💡 Feature Request Guidelines

### Information to Include

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Use Cases**: Who would benefit and how?
- **Implementation Notes**: Technical considerations

### Feature Request Template

```markdown
**Problem Statement**
A clear description of the problem this feature would solve.

**Proposed Solution**
A clear description of what you want to happen.

**Alternatives Considered**
A clear description of any alternative solutions you've considered.

**Use Cases**
Describe who would use this feature and how.

**Additional Context**
Add any other context, mockups, or examples about the feature request.

**Implementation Considerations**

- Accessibility impact
- Performance implications
- Browser compatibility
- Mobile considerations
```

## 🏗️ Architecture Guidelines

### Component Structure

- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper error boundaries
- Consider server vs client components

### State Management

- Use Zustand for global client state
- Use React Context for SSR-compatible state
- Keep state as local as possible
- Implement proper state persistence

### 3D Scene Organization

- Separate scene logic from React components
- Use proper Three.js disposal patterns
- Implement performance monitoring
- Consider WebGL context loss recovery

## 📚 Documentation Standards

### Code Documentation

- Use JSDoc for functions and classes
- Document complex algorithms
- Explain non-obvious code decisions
- Include usage examples

```typescript
/**
 * Calculates the optimal camera position for focusing on a 3D object
 * @param target - The target object to focus on
 * @param distance - Desired distance from the target
 * @param angle - Camera angle in radians
 * @returns The calculated camera position
 */
export const calculateCameraPosition = (
  target: Vector3,
  distance: number,
  angle: number
): Vector3 => {
  // Implementation with clear comments
};
```

### README Updates

- Keep setup instructions current
- Update feature lists
- Include troubleshooting information
- Add examples and screenshots

## 🔄 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

Examples:

```
feat: add 3D project card hover animations
fix: resolve WebGL context loss on mobile Safari
docs: update asset pipeline documentation
```

## 🆘 Getting Help

### Resources

- **Documentation**: Check the docs/ directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Examples**: Look at existing components for patterns

### Communication

- Be specific about your problem or question
- Include relevant code snippets
- Provide context about what you're trying to achieve
- Be patient and respectful

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs
- Special thanks for major features or fixes

Thank you for contributing to the 3D Portfolio Website! Your efforts help make this project better for everyone. 🚀
