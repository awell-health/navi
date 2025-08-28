# SMART on FHIR Sidecar Error Scenarios

This document outlines the different error scenarios that can occur when the SMART on FHIR sidecar loads, what needs to be communicated to the clinician, what actions they can take, and who needs to be informed.

## 1. No SMART Session Found

**Scenario**: User accesses `/smart/home` without a valid session ticket or the ticket has expired.

**What to communicate**:
- "No SMART Session Found"
- "Please start from your EHR's SMART app launcher."

**What the clinician can do**:
- Return to their EHR system
- Launch the SMART app again from the EHR interface
- Contact IT support if the issue persists

**Who needs to know**:
- IT Support (if issue persists)
- EHR Administrator (for configuration issues)

## 2. Invalid or Expired Session Ticket

**Scenario**: Session ticket exists but cannot be decrypted or has expired.

**What to communicate**:
- "Session has expired"
- "Please relaunch the application from your EHR."

**What the clinician can do**:
- Relaunch the SMART app from the EHR
- Check if they've been idle for too long
- Contact IT support if repeatedly failing

**Who needs to know**:
- IT Support (for recurring issues)
- Development team (if ticket expiration is too short)

## 3. Patient Not Found

**Scenario**: SMART session exists but patient data cannot be retrieved from the FHIR server.

**What to communicate**:
- "Patient Not Found"
- "Unable to load patient information from the EHR."

**What the clinician can do**:
- Verify the patient exists in the EHR
- Check patient permissions and access rights
- Try launching for a different patient
- Contact EHR support

**Who needs to know**:
- EHR Administrator (for patient data issues)
- IT Support (for FHIR connectivity issues)

## 4. Invalid Patient Context

**Scenario**: Patient ID exists but patient data is malformed or incomplete.

**What to communicate**:
- "Patient information incomplete"
- "Some patient details could not be loaded."

**What the clinician can do**:
- Continue with limited functionality
- Update patient information in the EHR
- Contact EHR support for data integrity issues

**Who needs to know**:
- EHR Administrator (for data quality issues)
- Data management team

## 5. No Tasks Available

**Scenario**: Patient exists but has no assigned tasks or activities.

**What to communicate**:
- "No Tasks Found"
- "This patient currently has no assigned tasks."

**What the clinician can do**:
- This is a normal state - no action required
- Create new care flows if needed
- Verify patient is enrolled in appropriate programs

**Who needs to know**:
- Care coordinators (if tasks are expected)
- Clinical team (for care plan review)

## 6. Task Loading Error

**Scenario**: Patient exists but task data cannot be retrieved due to API errors.

**What to communicate**:
- "Error Loading Tasks"
- "Unable to load patient tasks. Please try again."

**What the clinician can do**:
- Refresh the page
- Try again in a few minutes
- Contact IT support if issue persists

**Who needs to know**:
- IT Support (immediately)
- Development team (for API issues)
- Clinical leadership (if affecting patient care)

## 7. Network Connectivity Issues

**Scenario**: Network problems prevent data loading or cause timeouts.

**What to communicate**:
- "Connection Error"
- "Please check your network connection and try again."

**What the clinician can do**:
- Check internet connectivity
- Try refreshing the page
- Contact IT support for network issues

**Who needs to know**:
- IT Support (for network infrastructure)
- Facility management (for internet service issues)

## 8. Authentication Failures

**Scenario**: SMART authentication fails or user lacks proper permissions.

**What to communicate**:
- "Authentication Error"
- "You may not have permission to access this patient's information."

**What the clinician can do**:
- Verify they have appropriate patient access
- Contact EHR administrator for permission issues
- Try logging out and back into the EHR

**Who needs to know**:
- EHR Administrator (for permission configuration)
- Compliance team (for access control issues)
- IT Support (for authentication system issues)

## 9. FHIR Server Unavailable

**Scenario**: The FHIR server is down or unreachable.

**What to communicate**:
- "Service Temporarily Unavailable"
- "The patient data service is currently unavailable. Please try again later."

**What the clinician can do**:
- Wait and try again later
- Use alternative workflows if available
- Contact IT support for urgent cases

**Who needs to know**:
- IT Support (immediately)
- Clinical leadership (for service impact)
- EHR vendor (if vendor-hosted)

## 10. Malformed Task Data

**Scenario**: Task data exists but is corrupted or in an unexpected format.

**What to communicate**:
- "Data Format Error"
- "Some task information could not be displayed properly."

**What the clinician can do**:
- Continue with available information
- Report the specific task causing issues
- Contact IT support

**Who needs to know**:
- Development team (for data format issues)
- Data management team (for data integrity)
- IT Support (for immediate resolution)

## 11. Insufficient SMART Scopes

**Scenario**: SMART app was launched with insufficient permissions/scopes.

**What to communicate**:
- "Insufficient Permissions"
- "This application needs additional permissions to function properly."

**What the clinician can do**:
- Contact EHR administrator to update app permissions
- Relaunch app after permission updates

**Who needs to know**:
- EHR Administrator (for scope configuration)
- IT Support (for SMART app setup)

## 12. Task Completion Errors

**Scenario**: User attempts to complete a task but the action fails.

**What to communicate**:
- "Unable to Complete Task"
- "The task could not be completed. Please try again or contact support."

**What the clinician can do**:
- Try completing the task again
- Document completion manually if urgent
- Contact IT support

**Who needs to know**:
- IT Support (for technical issues)
- Clinical team (for workflow impact)
- Development team (for completion logic issues)

## General Escalation Guidelines

### Immediate Escalation (Patient Care Impact)
- Authentication failures preventing patient access
- FHIR server unavailable during critical care
- Task completion failures for time-sensitive activities

### Standard Escalation (Business Hours)
- Data format issues
- Permission configuration problems
- Network connectivity issues

### Low Priority (Next Business Day)
- UI/UX improvements
- Performance optimization
- Feature enhancement requests

## Monitoring and Alerting

### Metrics to Track
- Session creation success rate
- Patient data retrieval success rate
- Task loading success rate
- Task completion success rate
- Average response times

### Alert Thresholds
- >5% failure rate for any core operation
- >2 second average response time
- >3 consecutive failures for any user

### Log Information to Capture
- Session ID and ticket information
- Patient ID (anonymized in logs)
- Error messages and stack traces
- User agent and browser information
- Timestamp and duration of operations
