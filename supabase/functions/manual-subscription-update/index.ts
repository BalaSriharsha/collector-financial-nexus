
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][MANUAL-SUB-UPDATE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("=== MANUAL SUBSCRIPTION UPDATE STARTED ===");

    const { paymentId, orderId, signature, planType } = await req.json();
    logStep("Request data received", { paymentId, orderId, signature, planType });

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("Authentication error", { error: authError.message });
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const user = authData.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get Razorpay credentials
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Verify payment with Razorpay
    logStep("Verifying payment with Razorpay", { paymentId });
    
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      logStep("Error fetching payment from Razorpay", { 
        status: paymentResponse.status, 
        error: errorText
      });
      throw new Error(`Failed to verify payment: ${paymentResponse.status} - ${errorText}`);
    }
    
    const paymentData = await paymentResponse.json();
    logStep("Payment data received", { 
      paymentId: paymentData.id,
      status: paymentData.status,
      amount: paymentData.amount,
      orderId: paymentData.order_id
    });
    
    // Verify payment is captured/successful
    if (paymentData.status !== 'captured') {
      throw new Error(`Payment not captured. Status: ${paymentData.status}`);
    }
    
    // Verify order ID matches
    if (paymentData.order_id !== orderId) {
      throw new Error(`Order ID mismatch. Expected: ${orderId}, Got: ${paymentData.order_id}`);
    }

    // Get order details to extract plan information
    logStep("Fetching order details", { orderId });
    
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: {
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      logStep("Error fetching order from Razorpay", { 
        status: orderResponse.status, 
        error: errorText
      });
      throw new Error(`Failed to fetch order: ${orderResponse.status} - ${errorText}`);
    }
    
    const orderData = await orderResponse.json();
    logStep("Order data received", { 
      orderId: orderData.id,
      amount: orderData.amount,
      notes: orderData.notes
    });
    
    // Extract plan information
    const orderUserId = orderData.notes?.user_id;
    const orderPlanType = orderData.notes?.plan_type || planType;
    
    // Verify user ID matches
    if (orderUserId !== user.id) {
      throw new Error(`User ID mismatch. Order user: ${orderUserId}, Current user: ${user.id}`);
    }
    
    // Verify plan type
    if (!['Premium', 'Organization'].includes(orderPlanType)) {
      throw new Error(`Invalid plan type: ${orderPlanType}`);
    }
    
    logStep("Payment verification successful", { 
      userId: user.id, 
      planType: orderPlanType,
      paymentAmount: paymentData.amount
    });

    // Calculate subscription dates
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    logStep("Calculated subscription dates", { 
      now: now.toISOString(),
      subscriptionEnd: subscriptionEnd.toISOString()
    });

    // Update profiles table
    logStep("=== UPDATING PROFILES TABLE ===");
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        subscription_tier: orderPlanType,
        updated_at: now.toISOString()
      })
      .eq("id", user.id)
      .select();

    if (profileError) {
      logStep("ERROR updating profiles table", { 
        error: profileError.message,
        code: profileError.code,
        details: profileError.details
      });
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
    
    logStep("Profiles table updated successfully", { 
      rowsAffected: profileData?.length || 0,
      updatedData: profileData
    });

    // Update subscribers table - use email as conflict target since it has unique constraint
    logStep("=== UPDATING SUBSCRIBERS TABLE ===");
    const subscriberUpdateData = {
      email: user.email,
      user_id: user.id,
      subscribed: true,
      subscription_tier: orderPlanType,
      subscription_end: subscriptionEnd.toISOString(),
      updated_at: now.toISOString(),
    };

    logStep("Subscriber data to upsert", subscriberUpdateData);

    // First try to update existing record, then insert if it doesn't exist
    const { data: existingSubscriber, error: findError } = await supabaseClient
      .from("subscribers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let subscriberData, subscriberError;

    if (existingSubscriber) {
      // Update existing record
      logStep("Updating existing subscriber record");
      const { data, error } = await supabaseClient
        .from("subscribers")
        .update(subscriberUpdateData)
        .eq("user_id", user.id)
        .select();
      subscriberData = data;
      subscriberError = error;
    } else {
      // Insert new record
      logStep("Inserting new subscriber record");
      const { data, error } = await supabaseClient
        .from("subscribers")
        .insert(subscriberUpdateData)
        .select();
      subscriberData = data;
      subscriberError = error;
    }

    if (subscriberError) {
      logStep("ERROR updating subscribers table", { 
        error: subscriberError.message,
        code: subscriberError.code,
        details: subscriberError.details
      });
      throw new Error(`Failed to update subscriber: ${subscriberError.message}`);
    }
    
    logStep("Subscribers table updated successfully", { 
      rowsAffected: subscriberData?.length || 0,
      updatedData: subscriberData
    });

    // Verify the updates
    logStep("=== VERIFYING DATABASE UPDATES ===");
    
    const { data: verifyProfile, error: verifyProfileError } = await supabaseClient
      .from("profiles")
      .select("subscription_tier, updated_at")
      .eq("id", user.id)
      .single();
      
    if (verifyProfileError) {
      logStep("Error verifying profile update", { error: verifyProfileError });
    } else {
      logStep("Profile verification successful", { 
        tier: verifyProfile.subscription_tier,
        updated: verifyProfile.updated_at
      });
    }

    logStep("=== MANUAL SUBSCRIPTION UPDATE COMPLETED ===", { 
      userId: user.id, 
      planType: orderPlanType, 
      subscriptionEnd: subscriptionEnd.toISOString(),
      paymentId: paymentData.id,
      profileUpdated: !!profileData?.length,
      subscriberUpdated: !!subscriberData?.length
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscription updated successfully",
      data: {
        userId: user.id,
        planType: orderPlanType,
        subscriptionEnd: subscriptionEnd.toISOString(),
        profileUpdated: !!profileData?.length,
        subscriberUpdated: !!subscriberData?.length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("=== ERROR IN MANUAL SUBSCRIPTION UPDATE ===", { 
      message: errorMessage, 
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
