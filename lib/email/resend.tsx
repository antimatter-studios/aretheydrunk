"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTeamInvitationEmail({
  to,
  invitedByName,
  teamName,
  inviteCode,
}: {
  to: string
  invitedByName: string
  teamName: string
  inviteCode: string
}) {
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${inviteCode}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #7df9ff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #7df9ff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 6px solid #000000; box-shadow: 12px 12px 0 #000000;">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <h1 style="margin: 0 0 24px 0; font-size: 48px; font-weight: 900; color: #000000; text-transform: uppercase;">
                      🎉 YOU'RE INVITED!
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #000000;">
                      ${invitedByName} invited you to join
                    </p>
                    <div style="background-color: #ff3b9a; border: 6px solid #000000; padding: 16px 24px; margin: 24px 0; box-shadow: 6px 6px 0 #000000;">
                      <p style="margin: 0; font-size: 32px; font-weight: 900; color: #000000; text-transform: uppercase;">
                        ${teamName}
                      </p>
                    </div>
                    <p style="margin: 24px 0; font-size: 18px; font-weight: 600; color: #000000; line-height: 1.6;">
                      Join the team to create parties, track who's drunk, and have fun with your crew!
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${inviteLink}" style="display: inline-block; background-color: #00ff88; color: #000000; text-decoration: none; font-size: 20px; font-weight: 900; text-transform: uppercase; padding: 20px 40px; border: 6px solid #000000; box-shadow: 8px 8px 0 #000000;">
                            JOIN THE TEAM →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 24px 0 0 0; font-size: 14px; font-weight: 600; color: #666666;">
                      Invited to: ${to}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #999999;">
                      If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 14px; font-weight: 700; color: #000000; text-align: center;">
                ARE THEY DRUNK?
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "ARE THEY DRUNK? <noreply@aretheydrunk.com>",
      to: [to],
      subject: `${invitedByName} invited you to join ${teamName}!`,
      html,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Failed to send email:", error)
    return { success: false, error: String(error) }
  }
}
