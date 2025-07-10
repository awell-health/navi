# Navi Architecture: Learning from Stripe's Real Implementation

This document explains how Stripe's payment system **actually** works (not the simplified version often described) and how we apply these patterns to Navi's healthcare activities platform.

## 🎯 **The Real Stripe Architecture**

### **Common Misconception**

> "Stripe Elements are just simple iframe containers that collect form data"

### **Reality Discovery**

After examining Stripe's actual implementation, we discovered a far more sophisticated architecture:

1. **Stripe.js CDN script** (`https://js.stripe.com/basil/stripe.js`) contains a **complete payment ecosystem**
2. **Elements are dynamic iframes** with real-time communication via postMessage
3. **Form submission** is orchestrated across multiple isolated security contexts
4. **No traditional form submission** - everything happens via secure token exchange

## 🔍 **How Stripe Elements Actually Work**

### **1. Dynamic iframe Generation**

```javascript
// When you create an Element:
const paymentElement = elements.create("payment");
paymentElement.mount("#payment-element");

// Stripe generates a dynamic iframe:
<iframe
  name="__privateStripeFrame3"
  src="https://js.stripe.com/v3/elements-inner-card-8a434729e4eb82355db4882974049278.html#style[base][color]=%2332325d&style[base][fontFamily]=system-ui&clientSecret=pi_3..."
  title="Secure payment input frame"
  frameborder="0"
  scrolling="no"
  style="border: none; width: 100%; height: 40px;"
/>;
```

**Key insights:**

- **Not static files** - Each iframe URL is dynamically generated
- **Configuration via URL** - Styling, client secrets, options in URL parameters
- **Unique per session** - Security tokens and hashes prevent reuse
- **Sandboxed environment** - Complete isolation from parent page

### **2. The Security Model**

```html
<!-- Multiple specialized iframes for different data types -->
<div
  id="payment-element"
  class="__PrivateStripeElement"
  style="margin: -4px 0px !important; padding: 0px !important; border: none !important; display: block !important; background: transparent !important; position: relative !important; opacity: 1 !important; clear: both !important; transition: height 0.35s !important;"
>
  <iframe
    name="__privateStripeFrame4321"
    frameborder="0"
    allowtransparency="true"
    scrolling="no"
    role="presentation"
    src="https://js.stripe.com/v3/elements-inner-card-[hash].html#config..."
  />
</div>

<div
  id="address-element"
  class="__PrivateStripeElement"
  style="margin: -4px 0px !important; padding: 0px !important; border: none !important; display: block !important; background: transparent !important; position: relative !important; opacity: 1 !important; clear: both !important; transition: height 0.35s !important;"
>
  <iframe
    name="__privateStripeFrame1234"
    frameborder="0"
    allowtransparency="true"
    scrolling="no"
    role="presentation"
    allow="payment *; publickey-credentials-get *"
    src="https://js.stripe.com/v3/elements-inner-address-[hash].html#config..."
  />
</div>

<!-- and so on... -->
```

**Security features:**

- **Domain isolation** - All iframes served from `js.stripe.com`
- **Sandboxed execution** - No access to parent DOM or other iframes
- **Token-only communication** - Raw payment data never leaves iframe
- **Origin validation** - Strict validation of parent domain

### **3. The Submit Process (This is the Key!)**

```javascript
// What happens when you click "Subscribe" or "Pay Now":
document
  .getElementById("submit-button")
  .addEventListener("click", async (e) => {
    e.preventDefault(); // NO traditional form submit!

    // Stripe orchestrates data collection from all iframes:
    const { error } = await stripe.confirmPayment({
      elements, // Contains references to all iframes
      confirmParams: {
        return_url: "https://example.com/success",
      },
    });
  });
```

**The real orchestration process:**

```javascript
// What stripe.confirmPayment() actually does:
async function confirmPayment(options) {
  const results = {};

  // 1. Send postMessage to each iframe
  paymentElementIframe.postMessage(
    {
      type: "GET_PAYMENT_DATA",
      requestId: "payment-123",
    },
    "https://js.stripe.com"
  );

  addressElementIframe.postMessage(
    {
      type: "GET_ADDRESS_DATA",
      requestId: "address-123",
    },
    "https://js.stripe.com"
  );

  linkElementIframe.postMessage(
    {
      type: "GET_LINK_DATA",
      requestId: "link-123",
    },
    "https://js.stripe.com"
  );

  // 2. Wait for responses from all iframes
  const paymentData = await waitForMessage("payment-123");
  const addressData = await waitForMessage("address-123");
  const linkData = await waitForMessage("link-123");

  // 3. Combine tokenized data and submit to Stripe API
  return await submitToStripeAPI({
    payment: paymentData.token, // Never raw card data!
    address: addressData.token,
    link: linkData.token,
    client_secret: options.client_secret,
  });
}
```

### **4. iframe Response Protocol**

```javascript
// Inside each Stripe iframe:
window.addEventListener("message", (event) => {
  if (event.origin !== "https://example.com") return; // Origin validation

  if (event.data.type === "GET_PAYMENT_DATA") {
    // Validate form data within iframe
    const isValid = validateCardNumber(cardInput.value);

    if (isValid) {
      // Tokenize sensitive data (never send raw data!)
      const token = tokenizeCardData({
        number: cardInput.value,
        expiry: expiryInput.value,
        cvc: cvcInput.value,
      });

      // Send token back to parent
      parent.postMessage(
        {
          type: "PAYMENT_DATA_RESPONSE",
          requestId: event.data.requestId,
          token: token,
          valid: true,
        },
        event.origin
      );
    } else {
      parent.postMessage(
        {
          type: "PAYMENT_DATA_RESPONSE",
          requestId: event.data.requestId,
          error: "Invalid card number",
          valid: false,
        },
        event.origin
      );
    }
  }
});
```

## 🏥 **Applying This to Navi Architecture**

### **Our Package Structure**

```
navi-core (types, utilities)
    ↓
navi-portal (iframe content generation)
    ↓
navi-loader (CDN script, postMessage orchestration)
    ↓
navi-js (NPM wrapper)
    ↓
navi-react (React components)
```

### **1. navi-loader (CDN Script)**

```javascript
// https://cdn.navi.com/v1/navi-loader.js
window.Navi = function (publishableKey) {
  return {
    // Create activity iframes
    renderActivities: (selector, options) => {
      const iframe = document.createElement("iframe");
      iframe.src =
        `https://embed.navi.com/embed/${options.pathwayId}?` +
        `token=${options.token}&` +
        `styling=${encodeURIComponent(JSON.stringify(options.styling))}`;
      iframe.style.cssText = "border: none; width: 100%; height: 600px;";
      document.querySelector(selector).appendChild(iframe);

      // Store iframe reference for later communication
      this._iframes = this._iframes || [];
      this._iframes.push(iframe);
    },

    // Submit activities (orchestrates postMessage to all iframes)
    submitActivities: async (options) => {
      const results = await Promise.all(
        this._iframes.map((iframe) => getActivityData(iframe))
      );

      return await submitToNaviAPI({
        activities: results,
        pathway_id: options.pathwayId,
        client_secret: options.clientSecret,
      });
    },
  };
};

// PostMessage orchestration helper
async function getActivityData(iframe) {
  const requestId = generateRequestId();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

    const messageHandler = (event) => {
      if (event.data.requestId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);
        resolve(event.data);
      }
    };

    window.addEventListener("message", messageHandler);

    iframe.contentWindow.postMessage(
      {
        type: "GET_ACTIVITY_DATA",
        requestId: requestId,
      },
      "https://embed.navi.com"
    );
  });
}
```

### **2. navi-portal (iframe Content)**

```typescript
// apps/navi-portal/src/app/embed/[pathway_id]/page.tsx
export default async function EmbedPage({
  params,
}: {
  params: { pathway_id: string };
}) {
  const pathway = await getPathway(params.pathway_id);

  return (
    <html>
      <head>
        <title>Navi Activity - {pathway.name}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Listen for postMessage from parent
            window.addEventListener('message', (event) => {
              if (event.origin !== '${process.env.ALLOWED_ORIGINS}') return;
              
              if (event.data.type === 'GET_ACTIVITY_DATA') {
                const activityData = collectActivityData();
                const validationResult = validateActivityData(activityData);
                
                if (validationResult.valid) {
                  // Process and tokenize activity data
                  const token = tokenizeActivityData(activityData);
                  
                  parent.postMessage({
                    type: 'ACTIVITY_DATA_RESPONSE',
                    requestId: event.data.requestId,
                    token: token,
                    valid: true
                  }, event.origin);
                } else {
                  parent.postMessage({
                    type: 'ACTIVITY_DATA_RESPONSE',
                    requestId: event.data.requestId,
                    error: validationResult.error,
                    valid: false
                  }, event.origin);
                }
              }
            });
          `,
          }}
        />
      </head>
      <body>
        <ActivityRenderer pathway={pathway} />
      </body>
    </html>
  );
}
```

### **3. Customer Integration**

```html
<!-- Customer's website -->
<script src="https://cdn.navi.com/v1/navi-loader.js"></script>

<div id="navi-activities"></div>
<button id="submit-activities">Submit Activities</button>

<script>
  const navi = Navi("pk_test_customer_key");

  // Render activities (creates iframes)
  navi.renderActivities("#navi-activities", {
    pathwayId: "pathway_123",
    token: "activity_token_abc",
    styling: {
      primaryColor: "#007bff",
      fontFamily: "Inter",
    },
  });

  // Submit activities (orchestrates postMessage)
  document
    .getElementById("submit-activities")
    .addEventListener("click", async () => {
      try {
        const result = await navi.submitActivities({
          pathwayId: "pathway_123",
          clientSecret: "client_secret_xyz",
          onSuccess: (data) => {
            console.log("Activities submitted successfully:", data);
            window.location.href = "/success";
          },
          onError: (error) => {
            console.error("Submission failed:", error);
            displayErrorMessage(error.message);
          },
        });
      } catch (error) {
        console.error("Submission error:", error);
      }
    });
</script>
```

## 🔒 **Security Architecture**

### **1. Domain Isolation**

```
Customer Domain:     https://customer.com
  ↓ (loads script)
CDN Domain:         https://cdn.navi.com/v1/navi-loader.js
  ↓ (creates iframe)
Embed Domain:       https://embed.navi.com/embed/pathway_123
  ↓ (API calls)
Backend Domain:     https://api.navi.com
```

### **2. Token-Based Communication**

```javascript
// NEVER send raw healthcare data across domains:
❌ parent.postMessage({
  patientName: 'John Doe',
  diagnosis: 'Hypertension'
}, '*');

// ALWAYS use tokenized data:
✅ parent.postMessage({
  token: 'activity_token_abc123',
  valid: true,
  requestId: 'req_456'
}, 'https://customer.com');
```

### **3. Origin Validation**

```javascript
// Strict origin checking in both directions:
window.addEventListener("message", (event) => {
  // In navi-portal iframe:
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn("Blocked message from unauthorized origin:", event.origin);
    return;
  }

  // In customer's navi-loader:
  if (event.origin !== "https://embed.navi.com") {
    console.warn("Blocked message from unauthorized origin:", event.origin);
    return;
  }

  // Process message...
});
```

## 📦 **Package Responsibilities**

### **navi-core**

- **Types and interfaces** for all packages
- **Utility functions** for data validation, formatting
- **No external dependencies** - Pure TypeScript utilities
- **Shared constants** and configuration

### **navi-portal**

- **iframe content generation** - Dynamic HTML/CSS/JS
- **Activity rendering** - Form components, questionnaires
- **Data validation** - Healthcare-specific validation rules
- **Token generation** - Secure data tokenization
- **API contracts** - Defines embed route signatures

### **navi-loader**

- **Global API** - `window.Navi` function
- **iframe orchestration** - Creates and manages iframes
- **postMessage coordination** - Handles communication protocol
- **Error handling** - Network failures, validation errors
- **Bundle size critical** - Must stay under 15KB gzipped

### **navi-js**

- **NPM wrapper** - Easy installation via npm
- **CDN version coordination** - Pins to specific CDN versions
- **TypeScript types** - Full type definitions
- **Environment detection** - Dev vs production URLs
- **Development DX** - Better error messages, debugging

### **navi-react**

- **React components** - `<NaviProvider>`, `<ActivityRenderer>`
- **Hooks** - `useNavi()`, `useActivitySubmission()`
- **React patterns** - Proper lifecycle management
- **State management** - React-specific state handling

## 🚀 **Development Workflow**

### **1. Development Mode**

```bash
# Start all services
pnpm dev

# This runs:
# - navi-portal: localhost:3000 (Next.js app)
# - test-integration: localhost:3001 (customer simulation)
# - Serves navi-loader.js at localhost:3000/navi-loader.js
```

### **2. Production Flow**

```bash
# Build and deploy navi-loader to CDN
cd packages/navi-loader
pnpm build
gsutil cp dist/navi-loader.js gs://cdn-navi-com/v1/navi-loader.js

# Deploy navi-portal to Vercel
cd apps/navi-portal
vercel deploy --prod

# Publish NPM packages
cd packages/navi-js
npm publish
```

### **3. Testing Strategy**

```javascript
// Cross-origin integration tests
describe("Navi Integration", () => {
  it("should handle postMessage communication", async () => {
    // 1. Load customer page at localhost:3001
    await page.goto("http://localhost:3001");

    // 2. Verify iframe creation
    const iframe = await page.locator('iframe[src*="localhost:3000/embed"]');
    expect(iframe).toBeVisible();

    // 3. Test postMessage flow
    await page.click("#submit-activities");

    // 4. Verify successful submission
    await expect(page.locator("#success-message")).toBeVisible();
  });
});
```

## 🎯 **Key Architectural Decisions**

### **1. Why CDN + iframe Architecture?**

- **Universal compatibility** - Works with any JavaScript framework
- **Security isolation** - Healthcare data never touches customer domain
- **Performance** - CDN distribution, cached scripts
- **Compliance** - Clear audit trail, controlled data flow

### **2. Why postMessage Instead of Direct API?**

- **Cross-origin security** - No CORS issues
- **Data isolation** - Sensitive data stays in iframe
- **Real-time validation** - Immediate feedback to user
- **Error handling** - Graceful degradation

### **3. Why Multiple Packages?**

- **Separation of concerns** - Each package has clear responsibility
- **Independent deployment** - Can update packages independently
- **Customer choice** - React customers can use navi-react, others use navi-js
- **Bundle optimization** - Customers only load what they need

## 🔧 **Implementation Priorities**

### **Phase 1: Core Framework**

1. **navi-loader basic structure** - Global API, iframe creation
2. **navi-portal embed routes** - Basic activity rendering
3. **postMessage protocol** - Communication between domains
4. **Local development** - localhost:3000 ↔ localhost:3001 testing

### **Phase 2: Production Ready**

1. **CDN deployment** - Automated build and deploy
2. **Security hardening** - Origin validation, token encryption
3. **Error handling** - Comprehensive error boundaries
4. **Performance optimization** - Bundle size, load times

### **Phase 3: Advanced Features**

1. **Activity types** - Forms, questionnaires, assessments
2. **Branding system** - Customer styling, themes
3. **Analytics** - Usage tracking, performance monitoring
4. **Documentation** - Customer integration guides

This architecture provides a solid foundation for building a healthcare activities platform that rivals Stripe's developer experience while meeting the unique security and compliance requirements of healthcare applications! 🏥
