import { useState } from "react";

const tools = [
  {
    id: "coldDM",
    name: "Cold DM",
    description: "Start conversations that convert.",
    fields: [
      { key: "targetType", label: "Target Business Type", placeholder: "e.g. Local restaurant owner" },
      { key: "service", label: "Your Service", placeholder: "e.g. Done-for-you video content" },
      { key: "problem", label: "Specific Problem You Noticed", placeholder: "e.g. They haven't posted in 3 weeks" }
    ],
    prompt: (d) => `Target: ${d.targetType}
My service: ${d.service}
Problem noticed: ${d.problem}

Write a cold DM:
- Under 4 lines
- Mention the real problem
- No fluff
- No "I hope this finds you well"
- End with a soft yes/no question
- Sound like a real person, not a bot`
  },
  {
    id: "followup",
    name: "Follow-up Email",
    description: "Re-engage a prospect who went silent.",
    fields: [
      { key: "serviceType", label: "Service Type", placeholder: "e.g. Monthly video content" },
      { key: "clientType", label: "Client Type", placeholder: "e.g. Local restaurant owner" },
      { key: "days", label: "Days Since Proposal", placeholder: "e.g. 5" }
    ],
    prompt: (d) => `Write a 4-line follow-up email to a client who went silent after I sent a proposal ${d.days} days ago.

Context:
- Service: ${d.serviceType}
- Client type: ${d.clientType}

Rules:
- Do not mention price
- Add soft urgency
- End with a yes/no question
- Keep it short and clear
- No cringe opener`
  },
  {
    id: "proposal",
    name: "Client Proposal",
    description: "Write a professional project proposal.",
    fields: [
      { key: "serviceType", label: "Service Type", placeholder: "e.g. Video editing retainer" },
      { key: "clientType", label: "Client Type / Industry", placeholder: "e.g. Local restaurant owner" },
      { key: "budget", label: "Monthly Budget", placeholder: "e.g. $1,400" }
    ],
    prompt: (d) => `Act as a senior copywriter. Write a project proposal for a ${d.serviceType} for a ${d.clientType}. Budget: ${d.budget}

Include:
- 3-line executive summary
- Scope of work with 4 clear deliverables
- 4-week timeline week by week
- Simple pricing table
- Strong closing CTA

Tone: confident, warm, simple words, no jargon.`
  },
  {
    id: "scopeOfWork",
    name: "Scope of Work",
    description: "Generate a clean, professional SOW.",
    fields: [
      { key: "projectType", label: "Project Type", placeholder: "e.g. Monthly video content retainer" },
      { key: "timeFrame", label: "Time Frame", placeholder: "e.g. 1 month, rolling" },
      { key: "clientType", label: "Client Type", placeholder: "e.g. Local restaurant" }
    ],
    prompt: (d) => `Create a one-page Scope of Work for:
- Project: ${d.projectType}
- Duration: ${d.timeFrame}
- Client: ${d.clientType}

Include:
- 5 clear deliverables
- 2-round revision policy
- 3 things NOT included
- Payment terms: 50% upfront, rest on delivery
- Kill fee clause: 25% if cancelled mid-project

Use plain English. Keep it simple. No legal jargon.`
  },
  {
    id: "difficultClient",
    name: "Difficult Client",
    description: "Handle scope creep without losing the client.",
    fields: [
      { key: "extraRequest", label: "Extra Request from Client", placeholder: "e.g. Add 4 more videos this month" },
      { key: "originalScope", label: "Original Agreement", placeholder: "e.g. 8 short form videos per month" },
      { key: "projectPrice", label: "Project Price", placeholder: "e.g. $1,400/month" },
      { key: "addOnPrice", label: "Price Per Extra Item", placeholder: "e.g. $150 per additional video" }
    ],
    prompt: (d) => `Client request: ${d.extraRequest}
Original agreement: ${d.originalScope}
Project price: ${d.projectPrice}

Write a reply email:
- Say this is out of scope
- Offer add-on at: ${d.addOnPrice}
- Under 6 lines
- Polite, firm, simple words
- No passive-aggressive tone
- Keep the relationship warm`
  },
  {
    id: "rateIncrease",
    name: "Rate Increase",
    description: "Ask for more without losing the client.",
    fields: [
      { key: "duration", label: "Duration Working Together", placeholder: "e.g. 6 months" },
      { key: "oldPrice", label: "Current Price", placeholder: "e.g. $800/month" },
      { key: "newPrice", label: "New Price", placeholder: "e.g. $1,200/month" },
      { key: "startDate", label: "Start Date for New Rate", placeholder: "e.g. July 1st" },
      { key: "results", label: "Results You've Delivered", placeholder: "e.g. 3x engagement, 500 new followers" }
    ],
    prompt: (d) => `I have worked with a client for ${d.duration} at ${d.oldPrice}. I want to increase my rate to ${d.newPrice} starting ${d.startDate}.

Write a 5-line email:
- Focus on value delivered
- Mention results: ${d.results}
- No apology
- Clear and calm tone
- Give them time to respond`
  },
  {
    id: "testimonial",
    name: "Testimonial Polisher",
    description: "Turn weak feedback into powerful social proof.",
    fields: [
      { key: "testimonial", label: "Original Testimonial", placeholder: "Paste the raw testimonial here...", multiline: true },
      { key: "metric", label: "Metric or Outcome to Highlight", placeholder: "e.g. 40% more bookings, 500 new followers" }
    ],
    prompt: (d) => `Rewrite this testimonial to make it more compelling:

"${d.testimonial}"

Rules:
- Make it more specific
- Add the result: ${d.metric}
- Keep the original person's voice and tone
- Under 50 words
- No corporate language`
  }
];

export default function AgencyTools() {
  const [activeTool, setActiveTool] = useState(0);
  const [formData, setFormData] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tool = tools[activeTool];
  const allFilled = tool.fields.every(f => formData[f.key]?.trim());

  const handleInput = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!allFilled || loading) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: tool.prompt(formData) }]
        })
      });
      const data = await res.json();
      setOutput(data.content?.map(b => b.text || "").join("") || "Something went wrong.");
    } catch {
      setOutput("Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToolChange = (i) => {
    setActiveTool(i);
    setFormData({});
    setOutput("");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0A0A0A", color: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.5px" }}>RENDR</span>
        <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1.5px solid #FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4px", fontWeight: 700, lineHeight: 1 }}>HQ</div>
        <span style={{ marginLeft: "14px", fontSize: "11px", color: "#3A3A3A", letterSpacing: "2px", textTransform: "uppercase" }}>Agency Tools</span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: "200px", borderRight: "1px solid #1A1A1A", padding: "16px 0", flexShrink: 0 }}>
          {tools.map((t, i) => (
            <button
              key={t.id}
              onClick={() => handleToolChange(i)}
              style={{
                width: "100%",
                padding: "11px 20px",
                background: "transparent",
                border: "none",
                borderLeft: activeTool === i ? "2px solid #FFFFFF" : "2px solid transparent",
                color: activeTool === i ? "#FFFFFF" : "#444",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                fontWeight: activeTool === i ? 500 : 400,
                transition: "all 0.1s"
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "36px 44px", overflowY: "auto", maxWidth: "680px" }}>

          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px" }}>{tool.name}</h2>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>{tool.description}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "28px" }}>
            {tool.fields.map(field => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: "#444", textTransform: "uppercase", marginBottom: "7px" }}>
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    value={formData[field.key] || ""}
                    onChange={e => handleInput(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    style={{ width: "100%", background: "transparent", border: "1px solid #1E1E1E", color: "#FFF", fontFamily: "inherit", fontSize: "14px", padding: "12px 16px", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] || ""}
                    onChange={e => handleInput(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    onKeyDown={e => e.key === "Enter" && allFilled && handleGenerate()}
                    style={{ width: "100%", background: "transparent", border: "1px solid #1E1E1E", color: "#FFF", fontFamily: "inherit", fontSize: "14px", padding: "12px 16px", outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!allFilled || loading}
            style={{
              background: allFilled && !loading ? "#FFFFFF" : "#1A1A1A",
              color: allFilled && !loading ? "#0A0A0A" : "#333",
              border: "none",
              padding: "13px 28px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: allFilled && !loading ? "pointer" : "not-allowed",
              letterSpacing: "-0.2px",
              transition: "all 0.15s",
              marginBottom: "28px"
            }}
          >
            {loading ? "Generating..." : "Generate →"}
          </button>

          {output && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#444", textTransform: "uppercase" }}>Output</span>
                <button
                  onClick={handleCopy}
                  style={{ background: "transparent", border: "1px solid #2A2A2A", color: copied ? "#FFF" : "#555", fontFamily: "inherit", fontSize: "11px", padding: "5px 14px", cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.15s" }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", padding: "22px", fontSize: "14px", lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#CCCCCC" }}>
                {output}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
