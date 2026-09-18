export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: 'خطأ: لم يتم ضبط مفتاح الـ API في Vercel.' });
    }

    const formattedContents = [];
    if (messages && Array.isArray(messages)) {
      messages.forEach(msg => {
        formattedContents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    const requestBody = {
      systemInstruction: {
        parts: [{ text: 'أنت مسؤول خدمات وإدارات الحملات الإعلانية لدى "Shushan للإعلانات الممولة". أجب بأسلوب احترافي، واضح ومختصر.' }]
      },
      contents: formattedContents
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'حدث خطأ أثناء الاتصال بمزود الذكاء الاصطناعي.';
      return res.status(500).json({ reply: `خطأ API: ${errorMessage}` });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم استلام رد.';
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    return res.status(500).json({ reply: `حدث خطأ داخلي: ${error.message}` });
  }
}
