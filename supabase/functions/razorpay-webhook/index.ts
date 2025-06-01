
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
    const event = JSON.parse(body);
    
    logStep("Event type", { event: event.event });

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = payment.order_id;
      
      logStep("Processing payment", { paymentId: payment.id, orderId: order });
      
      // Get order details to extract user information
      const keyId = Deno.env.get("RAZORPAY_KEY_ID");
      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      
      const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${order}`, {
        headers: {
          "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
      });
      
      const orderData = await orderResponse.json();
      const userId = orderData.notes.user_id;
      const email = orderData.notes.email;
      const planType = orderData.notes.plan_type;
      const trialDays = parseInt(orderData.notes.trial_days || "0");
      
      logStep("Processing payment for user", { userId, email, planType, trialDays });

      // Calculate subscription dates
      const now = new Date();
      const subscriptionStart = trialDays > 0 ? new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000)) : now;
      const subscriptionEnd = new Date(subscriptionStart.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from start

      logStep("Subscription dates calculated", { 
        subscriptionStart: subscriptionStart.toISOString(), 
        subscriptionEnd: subscriptionEnd.toISOString() 
      });

      // Update subscribers table - use upsert to handle existing records
      const { data: subscriberData, error: subscriberError } = await supabaseClient
        .from("subscribers")
        .upsert({
          email: email,
          user_id: userId,
          subscribed: true,
          subscription_tier: planType,
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select();

      if (subscriberError) {
        logStep("Error updating subscriber", { error: subscriberError });
        throw subscriberError;
      } else {
        logStep("Subscriber updated successfully", { data: subscriberData });
      }

      // Update profiles table
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: planType
        })
        .eq("id", userId)
        .select();

      if (profileError) {
        logStep("Error updating profile", { error: profileError });
        throw profileError;
      } else {
        logStep("Profile updated successfully", { data: profileData });
      }

      logStep("Subscription activated successfully", { 
        userId, 
        planType, 
        subscriptionEnd: subscriptionEnd.toISOString(),
        paymentId: payment.id 
      });
    }

    return new Response("OK", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in razorpay-webhook", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
