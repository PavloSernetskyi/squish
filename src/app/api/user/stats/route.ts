import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const supabase = supabaseServer();
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user profile with stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: "Failed to fetch user stats" },
        { status: 500 }
      );
    }

    // Get recent sessions
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('id, duration_min, started_at, completed_at, status, rating')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: "Failed to fetch recent sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: {
        email: profile.email,
        name: profile.name,
        total_sessions: profile.total_sessions || 0,
        total_meditation_time_sec: profile.total_meditation_time_sec || 0,
        last_session_at: profile.last_session_at,
        created_at: profile.created_at
      },
      recent_sessions: recentSessions || []
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

