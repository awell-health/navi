# Patient Portal - High-Level Overview

The application is a **Next.js 15 (App Router) edge-rendered portal** that shows dynamic “activities” to patients during onboarding and care-flow execution.  
The UI component rendered at any moment is determined by a GraphQL subscription pushed from the Awell backend.

**Primary goals**

1. **Sub-1 s First Contentful Paint (FCP) on 4 G mobile** in target geos (US, EU, UK).  
2. **Runtime flexibility** – arbitrary activity components, per-org branding, multiple locales, customer-specific domains.  
3. **HIPAA-aligned logging** and de-identified analytics, with customer-scoped data views.  
4. **WCAG 2.1 AA accessibility** out-of-the-box.

## Detailed Requirements

This document links to the detailed requirement files that follow:

1. **[Architecture](./01-architecture.md)** - System architecture and technical stack
2. **[Authentication](./02-authentication.md)** - User authentication and authorization
3. **[Performance](./03-performance.md)** - Performance requirements and optimization
4. **[Branding and Theming](./04-branding-and-theming.md)** - Customization and branding capabilities
5. **[Internationalization and Content](./05-i18n-and-content.md)** - Multi-language support and content management
6. **[Accessibility](./06-accessibility.md)** - WCAG compliance and accessibility features
7. **[Logging and Analytics](./07-logging-and-analytics.md)** - HIPAA-compliant logging and analytics
8. **[Deployment](./08-deployment.md)** - Deployment and infrastructure requirements