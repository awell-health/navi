5-Day “Learning Spike” → Launch Pad

Day	Outcome	Why this matters	Concrete Tasks & Checkpoints
Mon AM – Bootstrap	✅ Repo scaffold with Next 15 App Router skeleton running on Vercel Edge	Lets you measure first-paint from hour 1	1. npx create-next-app@latest navi --experimental-app .. 2. Push → Vercel preview; confirm edge runtime. 3. Add Lighthouse CI GitHub Action (mobile preset) to fail build on regressions.
Mon PM – Magic-link auth	✅ End-to-end magic link → JWT cookie	Highest-risk, must work before anything else	1. Edge Function /magic/[token] that: decrypts stub token, writes to in-memory map, sets awell.sid + awell.jwt cookies, returns “Hello, Patient…” page. 2. Jest test: invalid / expired token returns 400.
Tue – Dynamic activity loader	✅ Browser receives activity descriptor over GraphQL WS and lazy-loads “HelloWorld” component	Validates chunk-splitting + WS auth path	1. Add graphql-ws serverless handler (can be in same edge function for POC). 2. Hard-code first activity descriptor {componentKey:'hello', props:{}}. 3. next/dynamic() import from components/activities/hello.tsx; verify network tab only pulls that chunk.
Wed – Branding & critical CSS	✅ Branding blob fetched from Vercel Edge Config, CSS vars inlined	End-user perceives theme instantly; tests Edge Config latency	1. Create Edge Config KV org:demo → {primaryColor:"#A45128"}. 2. Edge function injects <style>:root{--primary:#A45128}</style>. 3. Chrome DevTools > Rendering → emulate slow 3G and note diff in FCP with/without inline CSS.
Thu – Caching & perf telemetry	✅ Cache headers + Web Vitals POST to /rum → BigQuery temp table	Confirms your performance budgets are measurable	1. Add Cache-Control: public, max-age=31536000, immutable on activity chunks. 2. Add next/script web-vitals snippet that POSTs {sessionId, orgId, FCP, TTI}. 3. Deploy; run pnpm lhci autorun and capture scores.
Fri – Failure & edge cases	✅ Degrade-graceful behaviour documented and demoed	Finds surprises before sprint-2	1. Kill WS endpoint → client falls back to REST poll every 5 s. 2. Simulate Edge Config miss → app shows “unbranded” but usable shell. 3. Cookie expiry after 15 min → silent refresh call succeeds.


⸻

Deliverables by Friday evening
	1.	Working live preview URL on Vercel showing:
	•	Magic-link auth flow
	•	Theme-coloured header
	•	First activity auto-loaded
	2.	Perf report (Lighthouse JSON + screenshot) meeting or beating target FCP < 1 s on 4 G emulation.
	3.	README-POC.md describing:
	•	How to generate test tokens
	•	How to run local perf checks (pnpm lhci autorun)
	•	How to inspect BigQuery web_vitals_poc table
	4.	Known gaps / risks doc (e.g., real session store, full JWT signing key rotation, accessibility audit still pending).

⸻

Why this ordering?
	•	Auth first – everything else is gated on a valid session.
	•	Component loader second – verifies that dynamic import + code-split strategy works before you polish UI.
	•	Branding inline – early proof that edge KV solves “theme flash”.
	•	Telemetry & cache – lets you tune with data the rest of the sprint.
	•	Failure drills – catch edge cases while code is still tiny.

⸻

After the spike (Weeks 2-4)
	•	Swap in real Postgres/Redis session store.
	•	Integrate Localazy bundles and RTL test.
	•	Add battle-tested GraphQL gateway (Apollo or Mercurius).
	•	Flesh out CI gates for bundle budgets and Axe accessibility checks.
	•	Roll in automated canary + Slack alert on FCP regression.