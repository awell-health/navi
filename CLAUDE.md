# Patient Portal Development Guide for Claude

## Critical Rules (P0 - Never Skip)
- **Requirements First**: Always consult `requirements/` folder before starting work
- **Performance**: FCP < 1000ms, TTI < 2500ms, bundle sizes within budget
- **Security**: HIPAA-aligned logging, secure JWT handling
- **Accessibility**: WCAG 2.1 AA compliance required

## Important Rules (P1 - Skip Only If Explicitly Told)
- **Planning**: Generate plans for complex/multi-component tasks (see Planning Matrix below)
- **Testing**: Create Vitest tests for important concepts and edge cases
- **Runtime**: Use Edge vs Node.js based on Runtime Decision Matrix

## Requirements Consultation
ALWAYS check `requirements/` folder structure:
- `00-overview.md` - High-level goals and requirement links
- `01-architecture.md` through `08-deployment.md` - Detailed specs

Ensure your approach aligns with documented constraints and goals.

## Planning Decision Matrix

### Generate Plan When:
- User requests "generate a plan" or "design X"
- Multiple components/files involved
- New architecture patterns needed
- Performance/security implications
- Unclear implementation steps

### Skip Planning When:
- User says "make X change" or "fix X"
- Simple bug fixes or typos
- Following existing code patterns
- User provides explicit steps

### Plan Template:
1. **Requirements Analysis** - Which requirements docs apply
2. **Technical Approach** - Architecture decisions
3. **Component Structure** - File organization and data flow
4. **Performance Strategy** - Meeting FCP/TTI budgets
5. **Testing Approach** - What and how to test
6. **Implementation Steps** - Ordered milestones

## Runtime Decision Matrix

### Use Edge Runtime:
- ✅ Simple API routes with basic data fetching
- ✅ Authentication middleware
- ✅ Static content with minimal logic
- ✅ Need <50ms response time
- ✅ Global distribution required
- ✅ No file system access needed

### Use Node.js Runtime:
- ❌ File system operations
- ❌ Complex processing (>100ms)
- ❌ Node.js-specific libraries
- ❌ Database connection pooling
- ❌ Image processing/heavy computation
- ❌ Large response streaming

**Default**: When unsure, use Node.js runtime and optimize to edge later if needed.

## Tech Stack & Commands

### Tools:
- **Package Manager**: `pnpm` (not npm/yarn)
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest
- **TypeScript**: Strict mode

### Key Commands:
- **Dev**: `pnpm dev --turbopack`
- **Build**: `pnpm build` (must pass)
- **Test**: `pnpm test`
- **Lint**: `pnpm lint`

## Development Workflow

### Phase 1: Design
- Consider UX, accessibility (WCAG 2.1 AA), mobile-first
- Validate against performance budgets and requirements

### Phase 2: Planning
Apply Planning Decision Matrix above

### Phase 3: Implementation
- Follow plan step-by-step
- Generate Vitest tests for key concepts
- Apply Runtime Decision Matrix
- Follow existing naming/structure patterns

### Phase 4: Red-Team Assessment
After completion, instruct user:
"Request red-team evaluation focusing on: engineering complexity, system reliability, pattern alignment, and future scalability."

## Performance Requirements
- **FCP**: < 1000ms on 4G mobile  
- **TTI**: < 2500ms
- **Bundle**: 15KB initial, 40KB per chunk
- **Caching**: Immutable for activity chunks

## Code Standards
- TypeScript strict mode
- Next.js 15 App Router patterns
- Error boundaries and fallbacks
- Mobile performance first
- WCAG 2.1 AA accessibility

## File Protection
**NEVER** modify/delete `.env` files without explicit permission - they contain sensitive production data.