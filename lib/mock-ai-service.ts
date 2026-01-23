// Mock AI service for prototyping (no API calls required)

import { Transcript } from './storage';
import { TranscriptCoordinates, SynthesisResponse } from './ai-service';

/**
 * Generate mock coordinates based on transcript content
 * Uses simple heuristics to position transcripts in the quadrant
 */
export async function generateMockCoordinates(transcript: Transcript): Promise<TranscriptCoordinates> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simple heuristic based on content
  const content = transcript.content.toLowerCase();
  const role = transcript.expertRole.toLowerCase();
  const category = transcript.category.toLowerCase();

  // Technical vs Business (-1 to 1)
  let technical = 0;
  if (content.includes('api') || content.includes('database') || content.includes('code') ||
      content.includes('technical') || role.includes('engineering') || role.includes('data')) {
    technical = -0.7;
  } else if (content.includes('roi') || content.includes('strategy') || content.includes('business') ||
             content.includes('market') || role.includes('vp') || role.includes('director')) {
    technical = 0.6;
  }

  // Tactical vs Strategic (-1 to 1)
  let strategic = 0;
  if (content.includes('step') || content.includes('how to') || content.includes('implement') ||
      content.includes('migration') || content.includes('setup')) {
    strategic = -0.6;
  } else if (content.includes('planning') || content.includes('vision') || content.includes('long-term') ||
             content.includes('strategy') || role.includes('vp') || role.includes('chief')) {
    strategic = 0.7;
  }

  // Add some variation based on transcript ID
  const idHash = transcript.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  technical += (idHash % 10 - 5) / 20; // ±0.25 variation
  strategic += ((idHash * 7) % 10 - 5) / 20; // ±0.25 variation

  // Clamp to -1 to 1 range
  technical = Math.max(-1, Math.min(1, technical));
  strategic = Math.max(-1, Math.min(1, strategic));

  return { technical, strategic };
}

/**
 * Generate mock synthesis response based on transcripts and position
 */
export async function generateMockSynthesis(
  query: string,
  transcripts: Transcript[],
  markerPosition: { x: number; y: number }
): Promise<SynthesisResponse> {
  // Simulate API delay (shorter since we have stage delays in the UI)
  await new Promise(resolve => setTimeout(resolve, 300));

  // Determine perspective based on marker position
  const perspective = {
    technical: markerPosition.x,
    strategic: markerPosition.y,
  };

  const perspectiveLabel = getPerspectiveLabel(markerPosition);

  // Use the transcripts as provided (already filtered by nearest proximity)
  // The count varies based on quadrant position (8-23 experts)
  const limitedTranscripts = transcripts;
  const expertCount = limitedTranscripts.length;

  // Generate answer based on transcripts
  const topics = limitedTranscripts.map(t => t.topic).slice(0, 2);

  // Vary the opening based on expert count to show different perspectives
  let answer = '';
  if (expertCount >= 20) {
    answer = `Drawing from a comprehensive set of ${expertCount} expert perspectives, `;
  } else if (expertCount >= 15) {
    answer = `Based on insights from ${expertCount} experts across this domain, `;
  } else if (expertCount >= 10) {
    answer = `Synthesizing ${expertCount} expert viewpoints, `;
  } else {
    answer = `From ${expertCount} specialized expert${expertCount !== 1 ? 's' : ''}, `;
  }

  if (markerPosition.y > 0.3) {
    // Strategic perspective - more senior leadership voices
    answer += `from a strategic perspective, ${query.toLowerCase()} requires long-term planning and organizational alignment. `;
    answer += `The key considerations include market positioning, competitive advantage, and sustainable growth that can weather market shifts and competitive pressures. `;

    // Vary which experts are prominently featured based on count
    const featuredExpert = expertCount > 15 ? 0 : Math.min(1, limitedTranscripts.length - 1);
    answer += `${limitedTranscripts[featuredExpert].expertName} emphasizes that "${limitedTranscripts[featuredExpert].keyInsights[0]}", which aligns with broader industry trends and emerging best practices across leading organizations. `;
    answer += `This approach demands careful consideration of how the initiative fits within the larger organizational vision and market landscape, ensuring that investments made today will continue to deliver value over multiple quarters or years.\n\n`;

    if (expertCount > 1) {
      answer += `${limitedTranscripts[1].expertName} adds that "${limitedTranscripts[1].keyInsights[0]}", reinforcing the importance of strategic foresight and proactive planning. `;
    }
    if (expertCount > 2) {
      answer += `Similarly, ${limitedTranscripts[2].expertName} points out that organizations often underestimate the change management required, noting that "${limitedTranscripts[2].keyInsights[0]}". `;
    }
    answer += `Success in this area typically requires executive sponsorship, cross-functional collaboration, and a clear roadmap that extends beyond immediate tactical wins. Leadership must balance the need for quick wins that demonstrate progress with the patience required for transformational change. The most successful initiatives establish clear governance structures, regular checkpoints, and mechanisms for course correction as market conditions evolve.`;
  } else if (markerPosition.y < -0.3) {
    // Tactical perspective
    answer += `from a tactical implementation standpoint, ${query.toLowerCase()} involves specific execution steps and hands-on work that requires attention to detail and coordination across multiple teams. `;
    answer += `${limitedTranscripts[0].expertName} notes that "${limitedTranscripts[0].keyInsights[0]}", which provides actionable guidance for teams on the ground who are responsible for day-to-day execution. `;
    answer += `The practical challenges include resource allocation, timeline management, and coordinating technical work across multiple workstreams while maintaining quality standards and meeting deadlines.\n\n`;

    if (expertCount > 1) {
      answer += `${limitedTranscripts[1].expertName} shares that "${limitedTranscripts[1].keyInsights[0]}", highlighting common pitfalls to avoid during implementation. `;
    }
    if (expertCount > 2) {
      answer += `${limitedTranscripts[2].expertName} emphasizes the importance of establishing clear processes early, observing that "${limitedTranscripts[2].keyInsights[0]}". `;
    }
    answer += `Successful execution typically requires clear milestones, dedicated ownership, and continuous monitoring to ensure progress stays on track and issues are addressed quickly before they escalate. Teams should establish regular stand-ups or check-ins, maintain transparent dashboards that show progress against key metrics, and create escalation paths for blockers. The best implementations also include buffer time for unexpected challenges and maintain flexibility to adjust tactics based on real-world feedback.`;
  } else {
    // Balanced perspective
    answer += `${query.toLowerCase()} involves both strategic planning and tactical execution, requiring teams to balance high-level vision with practical implementation details. `;
    answer += `${limitedTranscripts[0].expertName} highlights that "${limitedTranscripts[0].keyInsights[0]}", underscoring the dual nature of this challenge and the need for organizations to excel at both strategic thinking and operational excellence. `;
    answer += `Organizations need to maintain alignment between long-term goals and day-to-day activities, ensuring that tactical work ladders up to strategic objectives while also allowing strategic plans to be informed by on-the-ground learnings.\n\n`;

    if (expertCount > 1) {
      answer += `${limitedTranscripts[1].expertName} reinforces this by noting that "${limitedTranscripts[1].keyInsights[0]}". `;
    }
    if (expertCount > 2) {
      answer += `${limitedTranscripts[2].expertName} adds valuable context about the importance of communication across levels, stating that "${limitedTranscripts[2].keyInsights[0]}". `;
    }
    answer += `The most successful approaches create feedback loops between strategic planning and tactical learnings, allowing teams to adjust course based on real-world implementation experience. This requires establishing regular forums where frontline teams can share insights with leadership, and where strategic direction can be communicated clearly to those executing the work. Organizations that excel in this area treat strategy and execution as interconnected rather than separate phases, recognizing that each informs and improves the other.`;
  }

  // Add a note about expert consensus/diversity based on count
  if (expertCount >= 20) {
    answer += `\n\nThis perspective draws from a broad consensus of ${expertCount} experts, providing comprehensive coverage of the various approaches and considerations in this space.`;
  } else if (expertCount >= 15) {
    answer += `\n\nThese insights represent ${expertCount} expert perspectives, offering a well-rounded view of the key considerations.`;
  } else if (expertCount >= 10) {
    answer += `\n\nThis analysis synthesizes ${expertCount} expert viewpoints, capturing core themes while acknowledging the focused nature of this perspective.`;
  } else {
    answer += `\n\nThis focused perspective from ${expertCount} specialized expert${expertCount !== 1 ? 's' : ''} offers targeted insights into this specific aspect.`;
  }

  if (markerPosition.x > 0.3) {
    // Business focus - fewer technical experts in this area
    const businessIntro = expertCount < 12
      ? `\n\nFrom a business-focused perspective with specialized expert input, `
      : `\n\nFrom a business perspective informed by ${expertCount} experts, `;
    answer += businessIntro + `the ROI and organizational impact are critical considerations that will determine whether this initiative receives continued investment and support. `;
    answer += `Leadership teams need to understand how this initiative will drive value, whether through revenue growth, cost reduction, or competitive differentiation, and they need evidence that the expected returns justify the resources being allocated. `;
    answer += `Clear metrics and regular reporting help maintain stakeholder confidence and support, while also providing early warning signs if the initiative is not tracking toward its intended outcomes. Organizations should establish baseline metrics before beginning, define success criteria upfront, and create dashboards that make progress visible to all stakeholders. The most effective approaches also include regular business reviews where teams can discuss results, share learnings, and make data-driven decisions about continuing, pivoting, or scaling the initiative.`;
  } else if (markerPosition.x < -0.3) {
    // Technical focus - fewer business experts in this area
    const techIntro = expertCount < 12
      ? `\n\nFrom a technical perspective with focused expert guidance, `
      : `\n\nFrom a technical standpoint drawing on ${expertCount} expert perspectives, `;
    answer += techIntro + `the implementation details and system architecture are paramount to ensuring the solution can scale and evolve with the business. `;
    answer += `Engineering teams need to carefully consider scalability, maintainability, and integration with existing systems, making architectural decisions that will serve the organization not just today but for years to come. `;
    answer += `Technical debt, performance optimization, and ensuring robust testing coverage are essential for long-term success and for preventing the solution from becoming a maintenance burden. Teams should invest in comprehensive documentation, automated testing, and monitoring from the outset. The best technical implementations also include regular architecture reviews, performance testing under realistic load conditions, and security audits to identify vulnerabilities before they can be exploited. Building with modularity and clear interfaces makes it easier to evolve individual components without requiring full rewrites.`;
  } else {
    // Balanced business/technical - most experts here
    const balancedIntro = expertCount >= 18
      ? `\n\nWith insights from ${expertCount} experts spanning business and technical domains, `
      : `\n\nSuccessful implementation requires balancing business objectives with technical constraints and opportunities. `;
    answer += balancedIntro;
    if (expertCount < 18) {
      answer += `Teams must ensure that technical decisions support business goals while also maintaining engineering excellence and system reliability. `;
    }
    answer += `This means establishing clear communication channels between business stakeholders and technical teams, translating business requirements into technical specifications, and helping business leaders understand technical tradeoffs. Regular cross-functional reviews help ensure alignment and catch potential issues early, whether they're business risks like market timing or technical risks like scalability limitations. The most successful initiatives treat business and technical considerations as equally important, recognizing that neither can succeed without the other.`;
  }

  // Generate citations from limited transcripts (maximum 23)
  const citations = limitedTranscripts.map(t => ({
    transcriptId: t.id,
    expertName: t.expertName,
    topic: t.topic,
    quote: t.keyInsights[0] || t.content.substring(0, 150) + '...',
  }));

  return {
    answer,
    citations,
    perspective,
  };
}

function getPerspectiveLabel(position: { x: number; y: number }): string {
  let label = '';

  if (position.y < -0.3) label += 'Tactical';
  else if (position.y > 0.3) label += 'Strategic';
  else label += 'Balanced';

  label += ' / ';

  if (position.x < -0.3) label += 'Technical';
  else if (position.x > 0.3) label += 'Business';
  else label += 'Balanced';

  return label;
}
