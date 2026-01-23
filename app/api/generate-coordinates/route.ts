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

    const { topic, category, expertRole, content, keyInsights } = await request.json();

    const prompt = `Analyze this expert transcript and classify it along two axes:

1. Technical ↔ Business (X-axis):
   -1 = Purely technical (APIs, databases, code, architecture, implementation details)
   0 = Balanced (mix of technical and business considerations)
   1 = Purely business (ROI, strategy, organizational, market dynamics)

2. Tactical ↔ Strategic (Y-axis):
   -1 = Tactical/Implementation (how-to, step-by-step, hands-on execution)
   0 = Balanced (mix of tactical and strategic thinking)
   1 = Strategic/High-level (vision, planning, long-term thinking)

Transcript:
Topic: ${topic}
Category: ${category}
Expert Role: ${expertRole}
Content: ${content}
Key Insights: ${keyInsights.join('; ')}

Return ONLY a valid JSON object with this exact structure:
{"technical": <number between -1 and 1>, "strategic": <number between -1 and 1>}`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 256,
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
    const jsonMatch = textContent.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to extract coordinates from AI response' },
        { status: 500 }
      );
    }

    const coordinates = JSON.parse(jsonMatch[0]);

    // Validate coordinates
    if (
      typeof coordinates.technical !== 'number' ||
      typeof coordinates.strategic !== 'number' ||
      coordinates.technical < -1 || coordinates.technical > 1 ||
      coordinates.strategic < -1 || coordinates.strategic > 1
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates returned from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json(coordinates);
  } catch (error) {
    console.error('Error generating coordinates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
