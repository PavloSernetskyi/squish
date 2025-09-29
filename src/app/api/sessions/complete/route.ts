import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { session_id, rating, notes } = await req.json();
    
    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

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

    // Update session to completed
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        rating: rating || null,
        notes: notes || null
      })
      .eq('id', session_id)
      .eq('user_id', user.id) // Ensure user owns this session
      .select()
      .single();

    if (sessionError) {
      console.error('Error completing session:', sessionError);
      return NextResponse.json(
        { error: "Failed to complete session" },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session_id: session.id,
      status: 'completed',
      completed_at: session.completed_at,
      duration_min: session.duration_min
    });

  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

