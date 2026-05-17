export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, capturedImage } = req.body;

    // 顔写真がある場合、印象・雰囲気・エネルギーの表現に変更
    const faceInstruction = capturedImage ? `

【顔写真について】
添付の顔写真から、その方の持つ雰囲気・表情の印象・顔全体から伝わるエネルギーや気質を読み取ってください。
「明るい印象」「穏やかなエネルギー」「意志の強さが感じられる」など、顔から伝わる第一印象や内面的な気質として表現し、四柱推命・血液型の鑑定結果と自然に組み合わせてください。
特定の人物の識別や断定的な人相判断ではなく、写真全体の雰囲気・印象・エネルギーの読み取りとして鑑定に反映してください。` : '';

    const fullPrompt = prompt + faceInstruction;

    const openaiMessages = capturedImage ? [{
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${capturedImage}` }
        },
        { type: "text", text: fullPrompt }
      ]
    }] : [{ role: "user", content: fullPrompt }];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1000,
        messages: openaiMessages,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '鑑定結果を取得できませんでした。';
    res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
