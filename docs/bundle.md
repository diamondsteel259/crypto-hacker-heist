# Bundle Analysis Guide

This document explains how to analyze and monitor the frontend bundle size of the Crypto Hacker Heist application.

## Running Bundle Analysis

To generate a detailed bundle analysis report:

```bash
npm run analyze
```

This will:
1. Build the application with bundle analysis enabled
2. Generate an interactive HTML report at `dist/public/stats.html`
3. Automatically open the report in your browser

## Understanding the Report

The bundle analyzer provides several views:

### Treemap View
- Shows the hierarchical structure of your bundle
- Larger rectangles represent larger modules
- Colors indicate different chunk types

### Sunburst View
- Circular visualization of bundle composition
- Helps identify which dependencies contribute most to bundle size

### Network View
- Shows module dependencies and relationships
- Useful for understanding import chains

## Bundle Size Budgets

Current size limits configured:

- **Main chunks**: Warn when exceeding 400KB
- **Individual chunks**: Monitored via rollup warnings
- **Asset inlining**: Files smaller than 4KB are inlined

### Manual Chunk Splitting

The application is configured to split vendor dependencies into logical chunks:

- `vendor`: React and React DOM
- `router`: Wouter routing library
- `ui`: Radix UI components
- `query`: TanStack Query
- `ton`: TON blockchain libraries

This improves caching by separating frequently updated code from stable vendor code.

## Pre-Merge Checklist

Before merging changes that affect the frontend:

1. Run `npm run analyze`
2. Check that main chunks stay under 400KB
3. Verify no excessive bundle size regressions
4. Review which dependencies contribute to size changes

### CI Integration

The bundle analysis can be integrated into CI workflows:

```yaml
- name: Analyze bundle size
  run: npm run analyze
- name: Check bundle size
  run: |
    # Add custom checks here if needed
    echo "Bundle analysis complete"
```

## Optimizing Bundle Size

### Lazy Loading

Consider lazy loading heavy components:

```tsx
import { lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use in component with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Code Splitting

Use dynamic imports for route-based splitting:

```tsx
// Instead of
import AdminDashboard from './AdminDashboard';

// Use
const AdminDashboard = lazy(() => import('./AdminDashboard'));
```

### Tree Shaking

Ensure imports are specific to avoid including unused code:

```tsx
// Good
import { Button } from '@/components/ui/button';

// Avoid
import * as UI from '@/components/ui';
```

## Monitoring Historical Bundle Size

Track bundle size over time by:

1. Saving `stats.html` reports for major releases
2. Recording bundle sizes in release notes
3. Setting up automated alerts for size regressions

## Troubleshooting

### Large Chunks

If you see unexpectedly large chunks:

1. Check the analyzer report to identify the culprit
2. Look for duplicate dependencies
3. Verify tree shaking is working correctly
4. Consider additional code splitting

### Missing Chunks

If the analyzer shows missing chunks:

1. Verify all imports are properly resolved
2. Check for circular dependencies
3. Ensure dynamic imports are correctly configured

### Performance Impact

Bundle size affects:

- Initial page load time
- Time to interactive (TTI)
- First contentful paint (FCP)
- User experience on slow connections

Monitor these metrics alongside bundle size to assess real-world impact.

## Tools and Resources

- [Bundle Analyzer](https://github.com/btd/rollup-plugin-visualizer) - Plugin used for analysis
- [Vite Bundle Optimization](https://vitejs.dev/guide/build.html#build-optimizations)
- [Web.dev Bundle Size](https://web.dev/bundle-size/) - Best practices for bundle optimization