import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { query, transcripts, markerPosition } = await request.json();

    // Build transcript context
    const transcriptContext = transcripts
      .map((t: any, idx: number) => {
        return `[Transcript ${idx + 1}]
Expert: ${t.expertName} (${t.expertRole})
Topic: ${t.topic}
Category: ${t.category}
Content: ${t.content}
Key Insights: ${t.keyInsights.join('; ')}
---`;
      })
      .join('\n\n');

    const prompt = `User asked: "${query}"

Based on exploration position:
- Technical/Business axis: ${markerPosition.x.toFixed(2)} (${markerPosition.x < -0.3 ? 'Technical' : markerPosition.x > 0.3 ? 'Business' : 'Balanced'})
- Tactical/Strategic axis: ${markerPosition.y.toFixed(2)} (${markerPosition.y < -0.3 ? 'Tactical' : markerPosition.y > 0.3 ? 'Strategic' : 'Balanced'})

Synthesize insights from these ${transcripts.length} expert transcripts:

${transcriptContext}

Provide:
1. A direct, comprehensive answer (4-6 sentences minimum, paragraph format) that addresses the user's question with rich detail and context
2. Specific citations showing which expert said what (include exact quotes)
3. Note the perspective based on the exploration position

Make the answer feel substantive and complete - like a well-written paragraph that thoroughly explores the topic.

Return a JSON object with this structure:
{
  "answer": "Your comprehensive answer here...",
  "citations": [
    {
      "transcriptId": "t1",
      "expertName": "Expert Name",
      "topic": "Transcript topic",
      "quote": "Direct quote from the transcript"
    }
  ],
  "perspective": {
    "technical": ${markerPosition.x},
    "strategic": ${markerPosition.y}
  }
}`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const textContent = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to extract synthesis from AI response' },
        { status: 500 }
      );
    }

    const synthesis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(synthesis);
  } catch (error) {
    console.error('Error synthesizing answer:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
