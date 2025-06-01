
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-UPI-QR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { amount, planType, orderId } = await req.json();
    logStep("QR generation request", { amount, planType, orderId });

    // UPI payment URL format
    const upiId = "vittas@razorpay"; // Replace with your actual UPI ID
    const payeeName = "Vittas";
    const transactionNote = `Payment for ${planType} Plan - Order ${orderId}`;
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount/100}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${orderId}`;
    
    // Generate QR code using a simple QR code service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    
    logStep("QR code generated", { qrCodeUrl, upiUrl });

    return new Response(JSON.stringify({
      qrCodeUrl: qrCodeUrl,
      upiUrl: upiUrl,
      upiId: upiId,
      amount: amount / 100,
      currency: "INR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-upi-qr", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
