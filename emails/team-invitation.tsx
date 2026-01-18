import type * as React from "react"

interface TeamInvitationEmailProps {
  invitedByName: string
  teamName: string
  inviteLink: string
  invitedEmail: string
}

export const TeamInvitationEmail: React.FC<TeamInvitationEmailProps> = ({
  invitedByName,
  teamName,
  inviteLink,
  invitedEmail,
}) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #7df9ff;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border: 6px solid black;
          box-shadow: 12px 12px 0 black;
        }
        .header {
          background: #ff3b9a;
          border-bottom: 6px solid black;
          padding: 40px;
          text-align: center;
        }
        h1 {
          font-size: 48px;
          font-weight: 900;
          margin: 0;
          color: black;
          text-transform: uppercase;
          letter-spacing: -2px;
        }
        .content {
          padding: 40px;
        }
        p {
          font-size: 18px;
          line-height: 1.6;
          color: black;
          margin: 0 0 20px 0;
        }
        .team-name {
          font-weight: 900;
          color: #ff3b9a;
        }
        .button {
          display: inline-block;
          background: #00ff88;
          color: black;
          text-decoration: none;
          padding: 20px 40px;
          border: 6px solid black;
          box-shadow: 8px 8px 0 black;
          font-weight: 900;
          font-size: 20px;
          text-transform: uppercase;
          margin: 30px 0;
        }
        .footer {
          background: #f0f0f0;
          border-top: 6px solid black;
          padding: 30px 40px;
          font-size: 14px;
          color: #666;
        }
        .emoji {
          font-size: 64px;
          margin: 20px 0;
        }
      `}</style>
    </head>
    <body>
      <div className="container">
        <div className="header">
          <div className="emoji">🎉</div>
          <h1>YOU'RE INVITED!</h1>
        </div>
        <div className="content">
          <p>Hey there!</p>
          <p>
            <strong>{invitedByName}</strong> has invited you to join the team{" "}
            <span className="team-name">{teamName}</span> on <strong>ARE THEY DRUNK?</strong>
          </p>
          <p>This is where you track party people and vote on their sobriety levels. It's going to be wild.</p>
          <p style={{ textAlign: "center" }}>
            <a href={inviteLink} className="button">
              JOIN THE TEAM
            </a>
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            This invitation was sent to {invitedEmail}. If you weren't expecting this, you can safely ignore it.
          </p>
        </div>
        <div className="footer">
          <p>
            <strong>ARE THEY DRUNK?</strong> - The ultimate party sobriety tracker
          </p>
          <p>If the button doesn't work, copy and paste this link:</p>
          <p style={{ wordBreak: "break-all", color: "#ff3b9a" }}>{inviteLink}</p>
        </div>
      </div>
    </body>
  </html>
)

export default TeamInvitationEmail
