require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const OPENAI_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || '';

async function queryOpenAI(prompt){
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are Vee Assistant, fluent in Arabic. Be helpful, safe, and concise.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  }, {
    headers: { Authorization: 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' }
  });
  return resp.data;
}

app.post('/vee-ai', async (req, res) => {
  try {
    const payload = req.body || {};
    const message = payload.message || '';
    const mode = payload.mode || 'general';
    const tool = payload.tool || '';
    if(!message) return res.status(400).json({ error: 'no message' });

    let prompt = '';
    if(payload.promptOverride){
      prompt = payload.promptOverride;
    } else {
      if(mode === 'tools' && tool){
        prompt = 'أنت مساعد متخصص في محتوى موقع Vee. كن مفصلاً وعملياً. القسم/الأداة: ' + tool + '\nسؤال: ' + message;
      } else {
        prompt = 'أنت مساعد عام للموقع Vee. أجب بالعربية وبوضوح.\nسؤال: ' + message;
      }
    }

    const aiResp = await queryOpenAI(prompt);
    const reply = (aiResp && aiResp.choices && aiResp.choices[0] && aiResp.choices[0].message) ? aiResp.choices[0].message.content : 'لا توجد استجابة من AI';
    res.json({ reply });
  } catch (err) {
    console.error(err && err.toString());
    res.status(500).json({ error: 'AI request failed', detail: err && err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Vee AI bridge listening on port '+port));
