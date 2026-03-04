import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // 1. Use Resend if configured (Allows custom sender name)
    if (process.env.RESEND_API_KEY) {
      const appName = process.env.VLY_APP_NAME || "Minimal Anime Stream";
      try {
        console.log("🔑 Attempting to send email via Resend...");
        console.log("📧 RESEND_FROM:", process.env.RESEND_FROM);
        console.log("🔐 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
        
        const fromEmail = process.env.RESEND_FROM?.includes('@') 
          ? process.env.RESEND_FROM 
          : `${process.env.RESEND_FROM || 'Anime'} <onboarding@resend.dev>`;
        
        console.log("📤 Sending from:", fromEmail);
        console.log("📬 Sending to:", email);
        
        await axios.post(
          "https://api.resend.com/emails",
          {
            from: fromEmail,
            to: email,
            subject: `Sign in to ${appName}`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #000;">Sign in to ${appName}</h2>
                <p>Please enter the following code on the sign in page:</p>
                <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${token}</span>
                </div>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Email sent successfully via Resend!");
        return;
      } catch (error) {
        console.error("❌ Failed to send via Resend, falling back to vly service:");
        console.error("Error details:", error);
        if (axios.isAxiosError(error)) {
          console.error("Response data:", error.response?.data);
          console.error("Response status:", error.response?.status);
        }
      }
    }

    // 2. Fallback to default vly.ai service (Sender name is fixed as vly.ai)
    try {
      await axios.post(
        "https://email.vly.ai/send_otp",
        {
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "Minimal Anime Stream",
        },
        {
          headers: {
            "x-api-key": "vlytothemoon2025",
          },
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});