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

    // Get user profile with stats (create if doesn't exist)
    const { data: initialProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let profile = initialProfile;

    // If profile doesn't exist, create it
    if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('No rows'))) {
      console.log('Profile not found, creating new profile for user:', user.id);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || null,
          total_sessions: 0,
          total_meditation_time_sec: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        console.error('User data:', { id: user.id, email: user.email });
        return NextResponse.json(
          { 
            error: "Failed to create user profile",
            details: createError.message,
            code: createError.code
          },
          { status: 500 }
        );
      }
      profile = newProfile;
      console.log('Profile created successfully for user:', user.id);
    } else if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { 
          error: "Failed to fetch user stats",
          details: profileError.message,
          code: profileError.code
        },
        { status: 500 }
      );
    }

    // Return stats in the format expected by VoicePanel
    return NextResponse.json({
      total_sessions: profile.total_sessions || 0,
      total_meditation_time_sec: profile.total_meditation_time_sec || 0,
      last_session_at: profile.last_session_at || null
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

