// ai_bridge.js - client helper to call server proxy (structure: message, mode, tool)
const AI_BRIDGE_URL = ""; // <-- set this to your deployed server endpoint, e.g. https://your-vercel-app.vercel.app/vee-ai
async function callAIBridge(payload){
  if(!AI_BRIDGE_URL) throw new Error('AI bridge not configured. Set AI_BRIDGE_URL in this file.');
  const r = await fetch(AI_BRIDGE_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if(!r.ok) throw new Error('AI bridge returned '+r.status);
  return r.json();
}
window.callAIBridge = callAIBridge;
