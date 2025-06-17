import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { FormActivityComponent } from '@/components/activities/form-activity';
import { getPathwayActivities } from './actions';
import { Activity } from '@/lib/awell-client/generated/graphql';

interface CareflowActivitiesPageProps {
  params: Promise<{
    careflow_id: string;
    stakeholder_id: string;
  }>;
}


export default async function CareflowActivitiesPage({ params }: CareflowActivitiesPageProps) {
  const { careflow_id, stakeholder_id } = await params;
  
  console.log('🏥 Careflow Activities Page Loading');
  console.log('📋 URL Params:', { careflow_id, stakeholder_id });
  
  // Verify session exists
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('awell.sid');
  
  console.log('🍪 Session cookie:', sessionCookie ? 'Found' : 'Not found');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie found, redirecting to 404');
    notFound();
  }

  // Get pathway activities
  console.log('🔍 Fetching pathway activities...');
  const activities = await getPathwayActivities(careflow_id, stakeholder_id);
  console.log('📊 Activities retrieved:', activities.length);
  
  if (activities.length === 0) {
    notFound();
  }

  // Find the first active form activity to display by default
  const activeFormActivity = activities.find(
    activity => 
      activity.object.type === 'FORM' && 
      activity.status === 'ACTIVE' && 
      activity.form
  );

  console.log('🎯 Active form activity:', activeFormActivity ? {
    id: activeFormActivity.id,
    form_title: activeFormActivity.form?.title,
    question_count: activeFormActivity.form?.questions?.length
  } : 'None found');

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    'use server';
    
    console.log('📝 Form submitted with data:', data);
    console.log('📋 Activity ID:', activeFormActivity?.id);
    
    // For prototype, just log the submission
    console.log('✅ Form submission logged (prototype mode)');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Activities Drawer */}
      <aside className="w-80 bg-card border-r border-border p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Activities</h2>
          <p className="text-sm text-muted-foreground">Your assigned tasks and forms</p>
        </div>
        
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                activity.status === 'ACTIVE' 
                  ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                  : 'border-border bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm text-foreground">
                  {activity.form?.title || `${activity.object.type} Activity`}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {activity.status}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                Type: {activity.object.type}
              </p>
              
              <p className="text-xs text-muted-foreground">
                {new Date(activity.date).toLocaleDateString()}
              </p>
              
              {activity.status === 'ACTIVE' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-medium text-primary">
                    Click to complete →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeFormActivity?.form ? (
          <FormActivityComponent 
            formActivity={activeFormActivity as Activity & { form: Required<Activity['form']>}}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No Active Activities</h2>
              <p className="text-muted-foreground">
                There are no active activities that require your attention at this time.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic';