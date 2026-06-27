// @/utils/exportReport.js
const LOG = (...a) => console.log("[DermAI-Export]",...a);

export const exportReport = (data, user) => {
  LOG("generating report", data.analysisNumber);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>DermAI Report</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      body { font-family:'Inter',sans-serif; background:#0A0A1A; color:#F5F0EB; margin:0; padding:40px; }
     .wrap { max-width:800px; margin:auto; }
     .header { border-bottom:2px solid #FF3E7F; padding-bottom:20px; margin-bottom:30px; }
      h1 { margin:0; font-size:28px; background:linear-gradient(90deg,#FF3E7F,#7B5EA7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
     .meta { color:rgba(245,240,235,0.6); font-size:13px; }
     .card { background:rgba(255,255,255,0.03); border:1px solid rgba(123,94,167,0.25); border-radius:16px; padding:24px; margin-bottom:20px; }
     .score { font-size:64px; font-weight:700; color:#FF3E7F; line-height:1; }
     .label { text-transform:uppercase; font-size:11px; letter-spacing:.08em; color:rgba(245,240,235,0.5); margin-bottom:8px; }
      ul { margin:0; padding-left:18px; } li { margin-bottom:6px; }
     .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>DermAI Skin Analysis</h1>
        <div class="meta">${user?.full_name} • ${user?.email || ''} • ${data.date}</div>
      </div>
      <div class="card">
        <div class="label">Overall Skin Health</div>
        <div class="score">${data.overallScore}<span style="font-size:24px;color:rgba(245,240,235,0.4)">/100</span></div>
        <p><strong>${data.verdict}</strong> — ${data.verdictDesc}</p>
        <p style="color:#F5C451">Skin Age Estimate: ${data.estimatedAge} years</p>
      </div>
      <div class="grid">
        <div class="card"><div class="label">AI Summary</div><p>${data.aiSummary}</p></div>
        <div class="card">
          <div class="label">Local Environmental Metrics</div>
          <p>Location: Gaighat, Uttar Pradesh, India<br>
          Date: ${new Date().toLocaleDateString()}<br>
          UV Index: 7 (High) • Humidity: 68% • AQI: 112 (Moderate)</p>
        </div>
      </div>
      <div class="card">
        <div class="label">Detected Concerns (${data.detectedConcerns.length})</div>
        <ul>${data.detectedConcerns.map(c=>`<li><strong>${c.name}</strong> — ${c.confidence}% • ${c.location}</li>`).join('') || '<li>None</li>'}</ul>
      </div>
    <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};