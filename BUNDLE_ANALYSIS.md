# Bundle Analysis

This project includes comprehensive bundle analysis tools to monitor and optimize frontend performance.

## Quick Start

### Run Bundle Analysis
```bash
npm run analyze
```
This builds the application and opens an interactive bundle analyzer in your browser.

### Check Bundle Sizes (CI-ready)
```bash
npm run check-bundle
```
This runs bundle analysis with size budgets and fails if limits are exceeded.

## Bundle Size Budgets

- **Main chunks**: 400 KB (warning limit)
- **TON chunk**: 500 KB (custom limit for blockchain libraries)
- **Total bundle**: 2 MB (recommended limit)

## Bundle Splitting Strategy

The application uses manual chunk splitting to optimize caching and loading:

- `vendor` - React and React DOM
- `router` - Wouter routing library  
- `ui` - Radix UI components
- `query` - TanStack Query
- `ton` - TON blockchain core libraries
- `tonconnect` - TON Connect UI components
- `forms` - React Hook Form and resolvers
- `utils` - Utility libraries (date-fns, clsx, etc.)
- `icons` - Icon libraries (lucide-react, react-icons)
- `charts` - Recharts library

## CI/CD Integration

### GitHub Actions
The `.github/workflows/bundle-analysis.yml` workflow automatically:
- Runs bundle analysis on every push and PR
- Checks bundle size budgets
- Uploads bundle reports as artifacts
- Comments on PRs with analysis results

### Local Development
Run bundle analysis before committing:
```bash
npm run check-bundle
```

## Optimization Tips

### Lazy Loading
For large components, use dynamic imports:
```tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Route-based Splitting
Split routes to reduce initial bundle size:
```tsx
// Instead of static imports
const AdminDashboard = lazy(() => import('./features/admin/Dashboard'));
```

### Tree Shaking
Import specific components instead of entire libraries:
```tsx
// Good
import { Button } from '@/components/ui/button';

// Avoid
import * as UI from '@/components/ui';
```

## Analyzing Results

### Bundle Analyzer Views
The generated `stats.html` includes several visualization modes:

1. **Treemap** - Hierarchical size breakdown
2. **Sunburst** - Circular dependency view
3. **Network** - Module relationship graph
4. **List** - Sorted by size

### Key Metrics to Monitor
- **Total bundle size** - Overall download size
- **Chunk sizes** - Individual chunk analysis
- **Gzip/Brotli sizes** - Real-world compressed sizes
- **Dependency count** - Number of modules

## Troubleshooting

### Large Chunks
If chunks exceed size limits:

1. **Check the analyzer report** to identify large dependencies
2. **Add to manual chunks** if it's a large library
3. **Implement lazy loading** for feature-specific code
4. **Remove unused dependencies** with bundle analysis

### Missing Dependencies
If dependencies are missing from chunks:

1. **Check import paths** - Ensure correct module resolution
2. **Verify side effects** - Some libraries need special handling
3. **Update manual chunks** configuration

### Performance Regression
To investigate performance issues:

1. **Compare bundle reports** between versions
2. **Check dependency versions** for size increases
3. **Review new features** for optimization opportunities

## Historical Tracking

Track bundle size over time:

```bash
# Save bundle report for versioning
cp dist/public/stats.html docs/bundle-reports/v1.0.0.html

# Track in release notes
echo "Bundle size: X KB (gzipped: Y KB)"
```

## Resources

- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Vite Bundle Optimization](https://vitejs.dev/guide/build.html#build-optimizations)
- [Web.dev Bundle Size Guide](https://web.dev/bundle-size/)
- [Bundlephobia](https://bundlephobia.com/) - Analyze npm package sizes