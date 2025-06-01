
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAZORPAY-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const body = await req.text();
    logStep("Raw webhook body", { bodyLength: body.length });
    
    const event = JSON.parse(body);
    logStep("Event parsed", { event: event.event, entityType: event.payload?.payment?.entity ? 'payment' : 'unknown' });

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      
      logStep("Processing payment captured", { 
        paymentId: payment.id, 
        orderId: orderId,
        amount: payment.amount,
        status: payment.status
      });
      
      // Get order details from Razorpay to extract user information
      const keyId = Deno.env.get("RAZORPAY_KEY_ID");
      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      
      if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials not configured");
      }
      
      logStep("Fetching order details from Razorpay", { orderId });
      
      const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        headers: {
          "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
      });
      
      if (!orderResponse.ok) {
        throw new Error(`Failed to fetch order details: ${orderResponse.status}`);
      }
      
      const orderData = await orderResponse.json();
      logStep("Order data received", { 
        orderId: orderData.id,
        notes: orderData.notes,
        amount: orderData.amount 
      });
      
      const userId = orderData.notes?.user_id;
      const email = orderData.notes?.email;
      const planType = orderData.notes?.plan_type;
      const trialDays = parseInt(orderData.notes?.trial_days || "0");
      
      if (!userId || !email || !planType) {
        throw new Error(`Missing required order data: userId=${userId}, email=${email}, planType=${planType}`);
      }
      
      logStep("Extracted order info", { userId, email, planType, trialDays });

      // Calculate subscription dates
      const now = new Date();
      const subscriptionStart = trialDays > 0 ? new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000)) : now;
      const subscriptionEnd = new Date(subscriptionStart.getTime() + (30 * 24 * 60 * 60 * 1000));

      logStep("Subscription dates calculated", { 
        subscriptionStart: subscriptionStart.toISOString(), 
        subscriptionEnd: subscriptionEnd.toISOString() 
      });

      // Update subscribers table - use upsert to handle existing records
      logStep("Updating subscribers table");
      const { data: subscriberData, error: subscriberError } = await supabaseClient
        .from("subscribers")
        .upsert({
          email: email,
          user_id: userId,
          subscribed: true,
          subscription_tier: planType,
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select();

      if (subscriberError) {
        logStep("Error updating subscriber", { error: subscriberError });
        throw subscriberError;
      }
      
      logStep("Subscriber updated successfully", { data: subscriberData });

      // Update profiles table to ensure consistency
      logStep("Updating profiles table");
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: planType,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select();

      if (profileError) {
        logStep("Error updating profile", { error: profileError });
        // Don't throw here as subscriber update was successful
        logStep("Profile update failed, but continuing", { error: profileError });
      } else {
        logStep("Profile updated successfully", { data: profileData });
      }

      // Verify the updates were successful
      const { data: verifyData, error: verifyError } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (verifyError) {
        logStep("Error verifying subscription update", { error: verifyError });
      } else {
        logStep("Subscription verification successful", { 
          subscribed: verifyData.subscribed,
          tier: verifyData.subscription_tier,
          end: verifyData.subscription_end
        });
      }

      logStep("Payment processing completed successfully", { 
        userId, 
        planType, 
        subscriptionEnd: subscriptionEnd.toISOString(),
        paymentId: payment.id 
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully",
        userId,
        planType,
        subscriptionEnd: subscriptionEnd.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("Unhandled event type", { eventType: event.event });
      return new Response(JSON.stringify({ message: "Event not handled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in razorpay-webhook", { 
      message: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
