REQUEST: i'd like for you to walk through the customer experience with me. there are a few use cases i'd like to run by you:

1. **starting a new care flow.** the customer loads navi in a react component on their website for either anonymous patient intake or identified patient intake. in this case, we'll be starting a new care flow when the customer's patient loads the page. so, in order to know which care flow to start,

- for anonymous patient intake, the only information other than the publishable key to start the care flow would be a "careflowDefinitionId" -- the definition ID of the published care flow that will be started. when the care flow is started, it will produce a unique "careflowId" (or 'careflow_id') that identifies the unique instance of the care flow started for a given patient (if the patient is anonymous, the patient will be created but not associated with any external identifier... hence "anonymous" patient)
- for identified patient intake, the publishable key and the careflow definition id will be required, but also a patient identifier, which is a FHIR-inspired object of `{ system: string; value: string }`
- ASIDE: in both of these above cases, there will need to be a call made to the navi-portal backend requesting a new care flow is started. navi-portal will have to make that call to our API after exchanging some information for a token.

2. **starting the portal for an already-running care flow.** the patient could have been provided a link that had some token at the end of it... we'd have to ask the customer's site to pass it along. alternatively, the customer could pass a careflow_id (along with an optional track_id or activity_id for more granular control over what should be completed in the care flow)...

---
