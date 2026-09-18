export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: 'خطأ: لم يتم ضبط مفتاح GROQ_API_KEY في Vercel.' });
    }

    const userMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'أنت المساعد الذكي لشركة شوشان للتسويق والتجارة (shushanmarketing.com). أجب عن استفسارات الزائر بأسلوب احترافي ومباشر.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ reply: `خطأ API: ${data.error?.message || 'خطأ غير معروف'}` });
    }

    const replyText = data.choices?.[0]?.message?.content || 'لم يتم استلام رد.';
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    return res.status(500).json({ reply: `حدث خطأ داخلي: ${error.message}` });
  }
}
