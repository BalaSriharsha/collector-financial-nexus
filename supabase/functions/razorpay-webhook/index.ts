
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][RAZORPAY-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("=== WEBHOOK RECEIVED ===");
    logStep("Request method", req.method);
    logStep("Request headers", Object.fromEntries(req.headers.entries()));

    const body = await req.text();
    logStep("Raw webhook body", { bodyLength: body.length, body: body.substring(0, 500) });
    
    if (!body) {
      throw new Error("Empty request body");
    }

    const event = JSON.parse(body);
    logStep("Event parsed successfully", { 
      event: event.event, 
      entityType: event.payload?.payment?.entity ? 'payment' : event.payload?.subscription?.entity ? 'subscription' : 'unknown',
      payloadKeys: Object.keys(event.payload || {})
    });

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      
      logStep("=== PROCESSING PAYMENT CAPTURED ===", { 
        paymentId: payment.id, 
        orderId: orderId,
        amount: payment.amount,
        status: payment.status,
        method: payment.method
      });
      
      // Get Razorpay credentials
      const keyId = Deno.env.get("RAZORPAY_KEY_ID");
      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      
      if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials not configured");
      }
      
      logStep("Fetching order details from Razorpay API", { orderId });
      
      // Fetch order details from Razorpay
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
          statusText: orderResponse.statusText,
          error: errorText
        });
        throw new Error(`Failed to fetch order details: ${orderResponse.status} - ${errorText}`);
      }
      
      const orderData = await orderResponse.json();
      logStep("Order data received from Razorpay", { 
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        status: orderData.status,
        notes: orderData.notes
      });
      
      // Extract order details
      const userId = orderData.notes?.user_id;
      const email = orderData.notes?.email;
      const planType = orderData.notes?.plan_type;
      const trialDays = parseInt(orderData.notes?.trial_days || "0");
      
      if (!userId || !email || !planType) {
        logStep("Missing required order data", { userId, email, planType });
        throw new Error(`Missing required order data: userId=${userId}, email=${email}, planType=${planType}`);
      }
      
      logStep("Extracted order information", { userId, email, planType, trialDays });

      // Calculate subscription dates
      const now = new Date();
      const subscriptionStart = trialDays > 0 ? new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000)) : now;
      const subscriptionEnd = new Date(subscriptionStart.getTime() + (30 * 24 * 60 * 60 * 1000));

      logStep("Calculated subscription dates", { 
        now: now.toISOString(),
        subscriptionStart: subscriptionStart.toISOString(), 
        subscriptionEnd: subscriptionEnd.toISOString(),
        trialDays
      });

      // Step 1: Update profiles table FIRST
      logStep("=== UPDATING PROFILES TABLE ===");
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: planType,
          updated_at: now.toISOString()
        })
        .eq("id", userId)
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

      // Step 2: Update subscribers table using upsert
      logStep("=== UPDATING SUBSCRIBERS TABLE ===");
      const subscriberUpdateData = {
        email: email,
        user_id: userId,
        subscribed: true,
        subscription_tier: planType,
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: now.toISOString(),
      };

      logStep("Subscriber data to upsert", subscriberUpdateData);

      const { data: subscriberData, error: subscriberError } = await supabaseClient
        .from("subscribers")
        .upsert(subscriberUpdateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select();

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

      // Step 3: Verify the updates by reading back the data
      logStep("=== VERIFYING DATABASE UPDATES ===");
      
      const { data: verifyProfile, error: verifyProfileError } = await supabaseClient
        .from("profiles")
        .select("subscription_tier, updated_at")
        .eq("id", userId)
        .single();
        
      if (verifyProfileError) {
        logStep("Error verifying profile update", { error: verifyProfileError });
      } else {
        logStep("Profile verification successful", { 
          tier: verifyProfile.subscription_tier,
          updated: verifyProfile.updated_at
        });
      }

      const { data: verifySubscriber, error: verifySubscriberError } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (verifySubscriberError) {
        logStep("Error verifying subscription update", { error: verifySubscriberError });
      } else {
        logStep("Subscription verification successful", { 
          subscribed: verifySubscriber.subscribed,
          tier: verifySubscriber.subscription_tier,
          end: verifySubscriber.subscription_end
        });
      }

      logStep("=== PAYMENT PROCESSING COMPLETED ===", { 
        userId, 
        planType, 
        subscriptionEnd: subscriptionEnd.toISOString(),
        paymentId: payment.id,
        profileUpdated: !!profileData?.length,
        subscriberUpdated: !!subscriberData?.length
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully",
        data: {
          userId,
          planType,
          subscriptionEnd: subscriptionEnd.toISOString(),
          profileUpdated: !!profileData?.length,
          subscriberUpdated: !!subscriberData?.length
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else {
      logStep("Unhandled event type", { eventType: event.event });
      return new Response(JSON.stringify({ 
        message: "Event not handled",
        eventType: event.event 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("=== ERROR IN WEBHOOK ===", { 
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
