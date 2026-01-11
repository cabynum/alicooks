/**
 * Supabase Edge Function: send-invite-sms
 *
 * Sends an SMS invite to join a DishCourse household using Twilio.
 * Also supports iMessage-compatible emails (e.g., phone@txt.att.net).
 *
 * Request body:
 * {
 *   "phoneOrEmail": "+1234567890" or "email@carrier.net",
 *   "inviteCode": "ABC123",
 *   "householdName": "Smith Family"
 * }
 *
 * Environment variables (Supabase secrets):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 *
 * Usage:
 * ```bash
 * # Set secrets
 * supabase secrets set TWILIO_ACCOUNT_SID=ACxxxx
 * supabase secrets set TWILIO_AUTH_TOKEN=xxxx
 * supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
 *
 * # Deploy
 * supabase functions deploy send-invite-sms
 * ```
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  phoneOrEmail: string;
  inviteCode: string;
  householdName: string;
}

interface TwilioResponse {
  sid?: string;
  error_code?: number;
  error_message?: string;
}

/**
 * Validates and normalizes a phone number.
 * Returns null if invalid.
 */
function normalizePhoneNumber(input: string): string | null {
  // Remove all non-digit characters except leading +
  const cleaned = input.replace(/[^\d+]/g, "");

  // Must have at least 10 digits
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }

  // Add country code if missing (assume US)
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

/**
 * Checks if input is an email (for carrier gateway SMS).
 */
function isEmail(input: string): boolean {
  return input.includes("@");
}

/**
 * Sends SMS via Twilio API.
 */
async function sendTwilioSMS(
  to: string,
  body: string,
  accountSid: string,
  authToken: string,
  fromNumber: string
): Promise<{ success: boolean; error?: string; sid?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const credentials = btoa(`${accountSid}:${authToken}`);

  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("From", fromNumber);
  formData.append("Body", body);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data: TwilioResponse = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", data);
      return {
        success: false,
        error: data.error_message || "Failed to send SMS",
      };
    }

    return { success: true, sid: data.sid };
  } catch (error) {
    console.error("Twilio request failed:", error);
    return { success: false, error: "Failed to connect to SMS service" };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Twilio credentials from environment
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: InviteRequest = await req.json();
    const { phoneOrEmail, inviteCode, householdName } = body;

    if (!phoneOrEmail || !inviteCode || !householdName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine if it's a phone number or email
    let destination: string;

    if (isEmail(phoneOrEmail)) {
      // Use email directly (for carrier gateway SMS like phone@txt.att.net)
      destination = phoneOrEmail;
    } else {
      // Normalize phone number
      const normalized = normalizePhoneNumber(phoneOrEmail);
      if (!normalized) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      destination = normalized;
    }

    // Compose the invite message
    const inviteUrl = `https://havedishcourse.vercel.app/join/${inviteCode}`;
    const message = `You're invited to join "${householdName}" on DishCourse! Tap to accept: ${inviteUrl}`;

    // Send the SMS
    const result = await sendTwilioSMS(
      destination,
      message,
      accountSid,
      authToken,
      fromNumber
    );

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
