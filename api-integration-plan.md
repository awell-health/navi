# API Integration Implementation Plan

## Requirements Analysis

This implementation will integrate the Awell Orchestration API to fetch real pathway activities and display them as conversational forms in the patient portal prototype.

### Key Requirements:
- Connect to Awell development server using prototype API key
- Query pathway activities via GraphQL using Awell SDK
- Display form activities as conversational forms
- Support magic link to form workflow
- Mock form submission for prototype

## Technical Approach

### Architecture Decisions:
1. **Runtime**: Continue using Node.js runtime for API integration capabilities
2. **SDK Integration**: Use existing `@awell-health/awell-sdk` package (already installed)
3. **Environment Configuration**: Add `PROTOTYPE_API_KEY` to environment variables
4. **API Strategy**: Real API with fallback to mock data for resilience

### API Integration Details:
- **Organization ID**: `awell-dev`
- **Tenant ID**: `_v0nvLX5zCNd`
- **Environment**: `development` 
- **API Endpoint**: GraphQL Orchestration API

## Component Structure

### Current Structure (Already Exists):
```
src/
├── lib/awell-sdk/
│   ├── client.ts (✅ SDK client setup)
│   └── types.ts (✅ Type definitions)
├── lib/activities/
│   └── form-mapper.ts (✅ Activity mapping)
├── components/activities/
│   └── form-activity.tsx (✅ Form component)
└── components/ui/
    └── conversational-form.tsx (✅ UI component)
```

### Required Updates:
1. **Environment Config**: Add PROTOTYPE_API_KEY validation
2. **API Query Logic**: Implement proper GraphQL query structure  
3. **Route Handler**: Update magic/[token]/route.ts with real API integration
4. **Form Rendering**: Ensure conversational form displays API-fetched questions

## Performance Strategy

### API Performance:
- **Timeout**: 5000ms for API calls (with fallback to mock)
- **Caching**: None required for prototype (real-time data needed)
- **Error Handling**: Graceful degradation to mock data

### Bundle Impact:
- No new dependencies required (SDK already installed)
- Estimated bundle impact: Minimal (~2KB for additional query logic)

## Testing Approach

### Integration Testing:
1. **API Connection**: Verify SDK connects to development environment
2. **Query Structure**: Validate GraphQL query returns expected form data
3. **Form Mapping**: Ensure API response maps correctly to conversational form
4. **Error Handling**: Test fallback to mock data when API unavailable

### Manual Testing:
1. **Magic Link Flow**: Verify token → activities → form display
2. **Form Questions**: Validate form questions render correctly from API
3. **Form Submission**: Confirm mock submission works

## Implementation Steps

### Phase 1: Environment and SDK Setup
1. ✅ **Environment Variable**: PROTOTYPE_API_KEY already configured in env.ts
2. ✅ **SDK Client**: Awell SDK client already configured
3. **API Query Structure**: Update GraphQL query with correct pathway activities structure

### Phase 2: API Integration
4. **Query Implementation**: Implement proper pathwayActivities query
5. **Response Processing**: Update form activity processing logic  
6. **Error Handling**: Ensure graceful fallback to mock data

### Phase 3: Form Integration  
7. **Route Update**: Update magic/[token]/route.ts to fetch and process real activities
8. **Form Display**: Ensure conversational form renders API-fetched questions
9. **Continue Button**: Update continue button to navigate to form with real data

### Phase 4: Testing and Validation
10. **End-to-End Testing**: Test complete magic link → form flow
11. **API Fallback Testing**: Verify mock data fallback when API unavailable
12. **Form Submission**: Test mock submission functionality

## GraphQL Query Structure

Based on API documentation, the query structure should be:

```graphql
pathwayActivities(pathway_id: $pathway_id) {
  activities {
    id
    pathway_id  
    activity_type
    status
    date
    subject {
      type
      id
    }
    form {
      id
      title
      questions {
        id
        title
        subtitle
        question_type
        user_question_type
        question_config {
          mandatory
          multiple_selection_config {
            allowed_multiple_selections
            range {
              min
              max
            }
          }
          number_config {
            range {
              min
              max
            }
          }
          date_config {
            include_date_of_response
            allowed_dates {
              from
              to
            }
          }
        }
        options {
          id
          value
          label
          value_string
        }
      }
    }
  }
}
```

## Security Considerations

- **API Key**: Environment variable properly validated in env.ts
- **HIPAA Compliance**: Log only activity IDs, not patient data
- **Token Security**: Continue using existing AES-GCM token encryption

## Risk Mitigation

1. **API Unavailability**: Graceful fallback to mock form activity
2. **Invalid Responses**: Type checking and validation before form mapping
3. **Network Timeouts**: 5000ms timeout with error handling
4. **Missing Form Data**: Default to mock activity if no form activities found

## Success Criteria

- ✅ Magic link successfully fetches pathway activities from Awell API
- ✅ Form activities render as conversational forms with API-fetched questions
- ✅ Continue button navigates from welcome page to form
- ✅ Form submission mock works correctly
- ✅ Graceful fallback to mock data when API unavailable
- ✅ Performance budgets maintained (FCP < 1000ms, TTI < 2500ms)