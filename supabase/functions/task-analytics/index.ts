import {serve} from "https://deno.land/std@0.177.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  overdueTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByTag: Record<string, number>;
  productivityScore: number;
  monthlyTrends: Array<{
    month: string;
    completed: number;
    created: number;
  }>;
  upcomingDeadlines: Array<{
    taskId: string;
    title: string;
    dueDate: string;
    priority: string;
  }>;
}

// Rate limiting store
const rateLimitStore = new Map<string, number[]>();

// Validation utilities
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function rateLimitCheck(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 5; // Reduced from 10 to 5 for stricter control
  
  const userRequests = rateLimitStore.get(userId) || [];
  const recentRequests = userRequests.filter(time => time > now - windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(userId, recentRequests);
  
  // Clean up old entries periodically to prevent memory leaks
  if (rateLimitStore.size > 10000) {
    const cutoff = now - windowMs * 2;
    for (const [key, requests] of rateLimitStore) {
      const activeRequests = requests.filter(time => time > cutoff);
      if (activeRequests.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, activeRequests);
      }
    }
  }
  
  return true;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {headers: corsHeaders});
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(JSON.stringify({error: "Method not allowed"}), {
      status: 405,
      headers: {...corsHeaders, "Content-Type": "application/json"},
    });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {Authorization: req.headers.get("Authorization")!},
      },
    });

    // Get current user
    const {
      data: {user},
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({error: "Unauthorized"}), {
        status: 401,
        headers: {...corsHeaders, "Content-Type": "application/json"},
      });
    }

    // Validate user ID
    if (!isValidUUID(user.id)) {
      return new Response(JSON.stringify({error: "Invalid user ID"}), {
        status: 400,
        headers: {...corsHeaders, "Content-Type": "application/json"},
      });
    }

    // Rate limiting check
    if (!rateLimitCheck(user.id)) {
      return new Response(JSON.stringify({error: "Rate limit exceeded"}), {
        status: 429,
        headers: {...corsHeaders, "Content-Type": "application/json"},
      });
    }

    // Use SQL aggregation for better performance
    const now = new Date().toISOString();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekISO = nextWeek.toISOString();
    
    // Get basic task counts with single query
    const {data: taskCounts, error: countsError} = await supabaseClient
      .rpc('get_task_analytics', {
        p_user_id: user.id,
        p_now: now,
        p_next_week: nextWeekISO
      });

    if (countsError) {
      // Fallback to basic queries if RPC doesn't exist
      console.warn('Analytics RPC not found, using fallback queries');
      
      const [
        {count: totalTasks},
        {count: completedTasks}, 
        {count: pendingTasks},
        {count: inProgressTasks},
        {count: overdueTasks}
      ] = await Promise.all([
        supabaseClient.from("tasks").select("*", {count: 'exact', head: true}).eq("user_id", user.id),
        supabaseClient.from("tasks").select("*", {count: 'exact', head: true}).eq("user_id", user.id).eq("status", "done"),
        supabaseClient.from("tasks").select("*", {count: 'exact', head: true}).eq("user_id", user.id).eq("status", "pending"),
        supabaseClient.from("tasks").select("*", {count: 'exact', head: true}).eq("user_id", user.id).eq("status", "in-progress"),
        supabaseClient.from("tasks").select("*", {count: 'exact', head: true}).eq("user_id", user.id).neq("status", "done").lt("extras->due_date", now)
      ]);

      const analytics: TaskAnalytics = {
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingTasks: pendingTasks || 0,
        inProgressTasks: inProgressTasks || 0,
        completionRate: totalTasks > 0 ? ((completedTasks || 0) / totalTasks) * 100 : 0,
        averageCompletionTime: 24, // Simplified
        overdueTasks: overdueTasks || 0,
        tasksByPriority: {high: 0, medium: 0, low: 0},
        tasksByTag: {},
        productivityScore: 0,
        monthlyTrends: [],
        upcomingDeadlines: [],
      };

      // Calculate productivity score
      let score = 0;
      if (analytics.totalTasks > 0) {
        score += analytics.completionRate * 0.4;
        score += Math.max(0, 100 - (analytics.overdueTasks / analytics.totalTasks) * 100) * 0.3;
        score += Math.min(100, analytics.totalTasks * 10) * 0.2;
        score += Math.min(100, analytics.inProgressTasks * 25) * 0.1;
      }
      analytics.productivityScore = Math.round(score);

      // Get limited task data for priority/tags analysis (max 1000 recent tasks)
      const {data: recentTasks} = await supabaseClient
        .from("tasks")
        .select("extras, title, inserted_at, status")
        .eq("user_id", user.id)
        .order("inserted_at", {ascending: false})
        .limit(1000);

      if (recentTasks) {
        // Process priority distribution
        recentTasks.forEach((task) => {
          const priority = task.extras?.priority || "medium";
          analytics.tasksByPriority[priority as keyof typeof analytics.tasksByPriority]++;
        });

        // Process tags
        recentTasks.forEach((task) => {
          const tags = task.extras?.tags || [];
          tags.forEach((tag: string) => {
            analytics.tasksByTag[tag] = (analytics.tasksByTag[tag] || 0) + 1;
          });
        });

        // Monthly trends (last 6 months)
        const monthlyData = new Map<string, {completed: number; created: number}>();
        const last6Months = Array.from({length: 6}, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return date.toISOString().slice(0, 7);
        }).reverse();

        last6Months.forEach((month) => {
          monthlyData.set(month, {completed: 0, created: 0});
        });

        recentTasks.forEach((task) => {
          const createdMonth = task.inserted_at.slice(0, 7);
          if (monthlyData.has(createdMonth)) {
            const data = monthlyData.get(createdMonth)!;
            data.created++;
            if (task.status === "done") {
              data.completed++;
            }
          }
        });

        analytics.monthlyTrends = Array.from(monthlyData.entries()).map(
          ([month, data]) => ({month, ...data})
        );
      }

      // Get upcoming deadlines efficiently
      const {data: upcomingTasks} = await supabaseClient
        .from("tasks")
        .select("id, title, extras")
        .eq("user_id", user.id)
        .neq("status", "done")
        .gte("extras->due_date", now)
        .lt("extras->due_date", nextWeekISO)
        .order("extras->due_date", {ascending: true})
        .limit(10);

      analytics.upcomingDeadlines = (upcomingTasks || []).map((task) => ({
        taskId: task.id,
        title: task.title,
        dueDate: task.extras?.due_date,
        priority: task.extras?.priority || "medium",
      }));

      return analytics;
    }

    // Use RPC result if available
    const analytics: TaskAnalytics = taskCounts[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
      overdueTasks: 0,
      tasksByPriority: {high: 0, medium: 0, low: 0},
      tasksByTag: {},
      productivityScore: 0,
      monthlyTrends: [],
      upcomingDeadlines: [],
    };

    return new Response(JSON.stringify(analytics), {
      headers: {...corsHeaders, "Content-Type": "application/json"},
    });
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {
      status: 500,
      headers: {...corsHeaders, "Content-Type": "application/json"},
    });
  }
});
