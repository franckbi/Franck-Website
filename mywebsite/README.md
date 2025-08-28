# 3D Portfolio Website

A modern, interactive 3D portfolio website built with Next.js 14, TypeScript, and react-three-fiber. Features a "Studio in the Cloud" concept with floating project cards in an immersive 3D environment, complete with accessibility fallbacks and performance optimizations.

## ✨ Features

- 🎨 **Interactive 3D Scenes** - Immersive Three.js experiences with floating project cards
- 🌙 **Theme System** - Dark/Light mode with system preference detection
- 📱 **Responsive Design** - Optimized for all devices and screen sizes
- ♿ **Accessibility First** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- ⚡ **Performance Optimized** - Code splitting, asset compression, and adaptive quality
- 🔍 **SEO Ready** - Meta tags, structured data, and semantic HTML
- 🎛️ **Low Power Mode** - Graceful degradation for battery-conscious users
- 📊 **Analytics & Monitoring** - Privacy-focused tracking and error reporting
- 🛡️ **Security Hardened** - CSP headers, input validation, and rate limiting

## 🚀 Tech Stack

### Core Framework

- **Next.js 14** - App Router with SSR/SSG capabilities
- **TypeScript** - Type safety and enhanced developer experience
- **React 18** - Concurrent features and Suspense

### 3D Graphics

- **Three.js** - WebGL 3D graphics engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions
- **@react-three/postprocessing** - Visual effects pipeline

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component primitives
- **Framer Motion** - Animation library for non-3D elements

### State & Data

- **Zustand** - Lightweight state management
- **React Context** - Theme and settings management
- **Zod** - Runtime type validation

### Performance & Assets

- **Draco** - 3D model compression
- **KTX2** - Optimized texture format
- **next/image** - Optimized image delivery
- **Service Worker** - Asset caching and offline support

### Development & Testing

- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality gates

## 🏗️ Getting Started

### Prerequisites

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher (or **yarn** 1.22.0+)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 3d-portfolio-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Contact form
   RESEND_API_KEY=your_resend_api_key
   CONTACT_EMAIL=your@email.com

   # Analytics (optional)
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

   # Monitoring (optional)
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup Checklist

- [ ] Environment variables configured
- [ ] Contact form tested with valid email service
- [ ] 3D assets loading correctly
- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run preview` - Preview production build locally

### Code Quality

- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing

- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI mode
- `npm run test:all` - Run all tests (unit + E2E)

### Performance & Analysis

- `npm run analyze` - Analyze bundle size
- `npm run lighthouse` - Run Lighthouse performance audit
- `npm run check-bundle` - Check bundle size against budget
- `npm run optimize-assets` - Optimize 3D assets and images

### Deployment

- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production
- `npm run health-check` - Verify deployment health

## 📁 Project Structure

```
3d-portfolio-website/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (pages)/                  # Route groups
│   │   ├── page.tsx                 # Home page with 3D hero
│   │   ├── about/                   # About page
│   │   ├── projects/                # Projects index and detail pages
│   │   └── contact/                 # Contact form page
│   ├── 📁 api/                      # API routes
│   │   ├── contact/                 # Contact form handler
│   │   └── health/                  # Health check endpoint
│   ├── layout.tsx                   # Root layout with providers
│   ├── globals.css                  # Global styles and CSS variables
│   ├── robots.ts                    # Dynamic robots.txt
│   └── sitemap.ts                   # Dynamic sitemap.xml
├── 📁 components/                   # Reusable React components
│   ├── 📁 3d/                       # 3D-specific components
│   │   ├── canvas-wrapper.tsx       # WebGL detection and setup
│   │   ├── hero-scene.tsx           # Main 3D hero scene
│   │   ├── project-card-3d.tsx      # Interactive 3D project cards
│   │   └── performance-monitor.tsx  # FPS and performance tracking
│   ├── 📁 layout/                   # Layout components
│   │   ├── header.tsx               # Navigation header
│   │   ├── footer.tsx               # Site footer
│   │   └── main-layout.tsx          # Main content wrapper
│   ├── 📁 ui/                       # Base UI components
│   │   ├── theme-toggle.tsx         # Dark/light mode switcher
│   │   ├── low-power-toggle.tsx     # Performance mode toggle
│   │   └── error-boundary.tsx       # Error handling wrapper
│   ├── 📁 home/                     # Home page components
│   ├── 📁 projects/                 # Project-related components
│   ├── 📁 about/                    # About page components
│   └── 📁 contact/                  # Contact form components
├── 📁 lib/                          # Utility libraries and configurations
│   ├── 📁 3d/                       # 3D-specific utilities
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 stores/                   # Zustand state stores
│   ├── 📁 utils/                    # General utility functions
│   ├── 📁 analytics/                # Analytics and tracking
│   ├── 📁 seo/                      # SEO utilities and metadata
│   └── 📁 validation/               # Form validation schemas
├── 📁 data/                         # Static content and configuration
│   └── assets.ts                    # 3D asset definitions and metadata
├── 📁 public/                       # Static assets
│   ├── 📁 data/                     # JSON content files
│   │   ├── projects.json            # Project portfolio data
│   │   ├── skills.json              # Skills and technologies
│   │   └── timeline.json            # Career timeline
│   ├── 📁 models/                   # 3D models and textures
│   ├── 📁 images/                   # Optimized images
│   ├── sw.js                        # Service worker
│   └── offline.html                 # Offline fallback page
├── 📁 test/                         # Test files
│   ├── 📁 __mocks__/                # Test mocks and fixtures
│   ├── setup.ts                     # Test environment setup
│   └── *.test.{ts,tsx}              # Unit and integration tests
├── 📁 e2e/                          # End-to-end tests
│   └── *.spec.ts                    # Playwright test specifications
├── 📁 scripts/                      # Build and deployment scripts
├── 📁 docs/                         # Documentation
│   ├── 📁 adr/                      # Architecture Decision Records
│   ├── CONTRIBUTING.md              # Contributor guidelines
│   ├── TROUBLESHOOTING.md           # Common issues and solutions
│   └── ASSET_PIPELINE.md            # 3D asset workflow documentation
└── 📁 .kiro/                        # Kiro AI specifications
    └── 📁 specs/3d-portfolio-website/
        ├── requirements.md          # Feature requirements
        ├── design.md                # Technical design document
        └── tasks.md                 # Implementation task list
```

## 🎯 Key Concepts

### 3D Scene Architecture

The application uses a layered approach to 3D rendering:

- **Canvas Wrapper** - Handles WebGL detection and fallbacks
- **Scene Components** - Manage 3D objects and interactions
- **Performance Monitor** - Tracks FPS and adjusts quality
- **Asset Manager** - Handles model loading and optimization

### Progressive Enhancement

- **Base Experience** - Semantic HTML and CSS work without JavaScript
- **Enhanced Experience** - Interactive features with JavaScript enabled
- **3D Experience** - Full WebGL rendering for capable devices
- **Fallback Experience** - Static images for low-power mode

### Performance Strategy

- **Code Splitting** - Route and feature-based lazy loading
- **Asset Optimization** - Draco compression and KTX2 textures
- **Adaptive Quality** - Dynamic LOD based on device performance
- **Memory Management** - Proper cleanup and garbage collection

## 🔧 Configuration

### Environment Variables

| Variable                       | Description                      | Required | Default     |
| ------------------------------ | -------------------------------- | -------- | ----------- |
| `RESEND_API_KEY`               | API key for email service        | Yes      | -           |
| `CONTACT_EMAIL`                | Recipient email for contact form | Yes      | -           |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Domain for Plausible analytics   | No       | -           |
| `SENTRY_DSN`                   | Sentry error tracking DSN        | No       | -           |
| `NODE_ENV`                     | Environment mode                 | Auto     | development |

### Performance Budgets

The project enforces performance budgets:

- **JavaScript Bundle** - ≤ 180KB gzipped (excluding Three.js)
- **3D Assets** - ≤ 1.2MB total for initial load
- **Images** - Automatically optimized with next/image
- **Lighthouse Score** - ≥ 90 for Performance, Accessibility, SEO

## 🧪 Testing

### Unit Tests

- **Components** - React Testing Library for UI components
- **Utilities** - Pure function testing with Vitest
- **Hooks** - Custom hook testing with renderHook
- **3D Logic** - Mocked Three.js for component logic

### Integration Tests

- **API Routes** - Request/response testing
- **Data Loading** - Content validation and error handling
- **State Management** - Store behavior and persistence

### End-to-End Tests

- **Critical Paths** - Home → Project → Contact flow
- **Accessibility** - Keyboard navigation and screen readers
- **Performance** - Core Web Vitals and 3D rendering
- **Cross-Browser** - Chrome, Firefox, Safari, Edge

### Visual Regression

- **3D Scenes** - Screenshot comparison for rendering consistency
- **UI Components** - Visual state testing across themes
- **Responsive Design** - Layout testing at different breakpoints

## 🚀 Deployment

### Staging Environment

```bash
npm run deploy:staging
```

- Automatic deployment on `develop` branch
- Feature branch previews available
- Full testing suite runs before deployment

### Production Environment

```bash
npm run deploy:production
```

- Manual deployment from `main` branch
- Performance budgets enforced
- Health checks and rollback capability

### Monitoring

- **Error Tracking** - Sentry integration for runtime errors
- **Performance** - Real User Monitoring (RUM) with Core Web Vitals
- **Analytics** - Privacy-focused tracking with Plausible
- **Uptime** - Health check endpoints for monitoring services

## 🤝 Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test:all`
5. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📚 Documentation

- [Architecture Decision Records](docs/adr/) - Technical decisions and rationale
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute to the project
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Asset Pipeline](docs/ASSET_PIPELINE.md) - 3D asset workflow and optimization
- [API Documentation](docs/api/) - API endpoint specifications

## 🐛 Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

Quick fixes:

- **3D not loading** - Check WebGL support and try low-power mode
- **Build errors** - Clear `.next` folder and reinstall dependencies
- **Performance issues** - Enable low-power mode or check device capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D graphics library
- [react-three-fiber](https://github.com/pmndrs/react-three-fiber) - React renderer for Three.js
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library

---

**Built with ❤️ using modern web technologies**
