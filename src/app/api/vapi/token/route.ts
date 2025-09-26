import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const publicApiKey = process.env.VAPI_PUBLIC_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    
    console.log("Environment check:", {
      hasPublicKey: !!publicApiKey,
      hasAssistantId: !!assistantId,
      assistantIdLength: assistantId?.length
    });

    if (!publicApiKey || !assistantId) {
      throw new Error("Missing Vapi environment variables. Please add VAPI_PUBLIC_KEY to your .env.local file.");
    }

    // Return the public API key and assistant ID for web calls
    console.log("Web call credentials ready");
    
    return NextResponse.json({
      apiKey: publicApiKey,
      assistantId: assistantId,
      type: "web"
    });
  } catch (error) {
    console.error("Error getting web call credentials:", error);
    return NextResponse.json(
      { error: `Failed to get web call credentials: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
