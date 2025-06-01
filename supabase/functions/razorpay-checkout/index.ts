
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAZORPAY-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planType } = await req.json();
    logStep("Plan type received", { planType });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Define pricing in INR
    let amount, planName, trialDays;
    if (planType === "Premium") {
      amount = 74900; // ₹749 in paise
      planName = "Vittas Premium Plan";
      trialDays = 7;
    } else if (planType === "Organization") {
      amount = 224900; // ₹2249 in paise
      planName = "Vittas Organization Plan";
      trialDays = 0;
    } else {
      throw new Error("Invalid plan type");
    }

    // Create Razorpay order
    const orderData = {
      amount: amount,
      currency: "INR",
      receipt: `vittas_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        email: user.email,
        plan_type: planType,
        trial_days: trialDays
      }
    };

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new Error(`Razorpay order creation failed: ${errorText}`);
    }

    const order = await orderResponse.json();
    logStep("Razorpay order created", { orderId: order.id });

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      planName: planName,
      trialDays: trialDays
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in razorpay-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
