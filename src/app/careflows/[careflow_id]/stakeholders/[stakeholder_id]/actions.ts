'use server';
import { apolloClient } from '@/lib/awell-client/client';
import { 
  PathwayActivitiesDocument, 
  type PathwayActivitiesQuery
} from '@/lib/awell-client/generated/graphql';

// Type alias for activities from the generated types
type Activity = PathwayActivitiesQuery['pathwayActivities']['activities'][0];

export async function getPathwayActivities(careflowId: string, stakeholderId: string): Promise<Activity[]> {
  console.log('🚀 Starting API call for pathway activities');
  console.log('📋 Careflow ID:', careflowId);
  console.log('👤 Stakeholder ID:', stakeholderId);
  
  try {
    console.log('🔄 Making GraphQL query to Awell API...');
    
    const { data } = await apolloClient.query({
      query: PathwayActivitiesDocument,
      variables: {
        pathway_id: careflowId
      }
    });

    console.log('📡 API Response received');
    console.log('📊 Raw response:', JSON.stringify(data, null, 2));

    if (data.pathwayActivities?.activities) {
      const allActivities = data.pathwayActivities.activities;
      console.log(`📋 Total activities found: ${allActivities.length}`);
      
      // Log all activities for debugging
      allActivities.forEach((activity: Activity, index: number) => {
        console.log(`Activity ${index + 1}:`, {
          id: activity.id,
          stream_id: activity.stream_id,
          status: activity.status,
          subject_id: activity.subject?.id,
          indirect_object_id: activity.indirect_object?.id,
          has_form: !!activity.inputs?.__typename && activity.inputs.__typename === 'FormActivityInputs'
        });
      });
      
      // Filter activities for the specific stakeholder
      const stakeholderActivities = allActivities.filter(
        (activity: Activity) => 
          activity.indirect_object?.id === stakeholderId ||
          activity.subject?.id === stakeholderId
      );
      
      console.log(`✅ Found ${stakeholderActivities.length} activities for stakeholder ${stakeholderId}`);
      
      if (stakeholderActivities.length > 0) {
        console.log('🎯 Filtered activities for stakeholder:', stakeholderActivities.map((a: Activity) => ({
          id: a.id,
          stream_id: a.stream_id,
          status: a.status,
          has_form: a.inputs?.__typename === 'FormActivityInputs'
        })));
      }
      
      return stakeholderActivities;
    }
    
    console.log('⚠️  No activities found in API response');
    return [];
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}