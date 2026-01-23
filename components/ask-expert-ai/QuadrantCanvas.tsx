'use client';

import { useEffect, useRef, useState } from 'react';
import { Transcript } from '@/lib/storage';
import { Point, quadrantToCanvas, canvasToQuadrant, findNearestTranscripts } from '@/lib/geometry-utils';

interface QuadrantCanvasProps {
  transcripts: Transcript[];
  markerPosition: Point;
  onMarkerMove: (position: Point) => void;
  nearbyTranscripts?: Transcript[];
  theme?: 'light' | 'dark';
  simplified?: boolean;
}

const CANVAS_HEIGHT = 280;
const PADDING = 40;
const MARKER_RADIUS = 10;
const TRANSCRIPT_RADIUS = 4;

export default function QuadrantCanvas({
  transcripts,
  markerPosition,
  onMarkerMove,
  nearbyTranscripts = [],
  theme = 'light',
  simplified = false,
}: QuadrantCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(600);

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    // Scale the context so we can draw at normal coordinates
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#1f1f1f' : '#f9fafb';
    ctx.fillRect(0, 0, canvasWidth, CANVAS_HEIGHT);

    // Draw axes
    drawAxes(ctx, canvasWidth, CANVAS_HEIGHT, theme);

    // Only draw transcript markers and proximity lines if not simplified
    if (!simplified) {
      // Draw transcript markers
      drawTranscriptMarkers(ctx, transcripts, canvasWidth, CANVAS_HEIGHT);

      // Draw proximity lines to nearby transcripts
      drawProximityLines(ctx, nearbyTranscripts, markerPosition, canvasWidth, CANVAS_HEIGHT);
    }

    // Draw user marker
    drawUserMarker(ctx, markerPosition, canvasWidth, CANVAS_HEIGHT);
  }, [transcripts, markerPosition, nearbyTranscripts, canvasWidth, simplified, theme]);

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: 'light' | 'dark') => {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db';
    ctx.lineWidth = 2;

    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(centerX, PADDING);
    ctx.lineTo(centerX, height - PADDING);
    ctx.stroke();

    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(PADDING, centerY);
    ctx.lineTo(width - PADDING, centerY);
    ctx.stroke();
  };


  const drawTranscriptMarkers = (
    ctx: CanvasRenderingContext2D,
    transcripts: Transcript[],
    width: number,
    height: number
  ) => {
    transcripts.forEach((transcript) => {
      if (!transcript.coordinates) return;

      const point = quadrantToCanvas(
        { x: transcript.coordinates.technical, y: transcript.coordinates.strategic },
        width,
        height,
        PADDING
      );

      // Check if this transcript is nearby
      const isNearby = nearbyTranscripts.some(t => t.id === transcript.id);

      ctx.fillStyle = isNearby ? '#45388F' : '#7769C4';
      ctx.beginPath();
      ctx.arc(point.x, point.y, isNearby ? TRANSCRIPT_RADIUS + 2 : TRANSCRIPT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      // Add glow effect for nearby transcripts
      if (isNearby) {
        ctx.strokeStyle = '#45388F';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawProximityLines = (
    ctx: CanvasRenderingContext2D,
    nearby: Transcript[],
    marker: Point,
    width: number,
    height: number
  ) => {
    const markerCanvas = quadrantToCanvas(marker, width, height, PADDING);

    ctx.strokeStyle = '#45388F';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    nearby.forEach((transcript) => {
      if (!transcript.coordinates) return;

      const transcriptCanvas = quadrantToCanvas(
        { x: transcript.coordinates.technical, y: transcript.coordinates.strategic },
        width,
        height,
        PADDING
      );

      ctx.beginPath();
      ctx.moveTo(markerCanvas.x, markerCanvas.y);
      ctx.lineTo(transcriptCanvas.x, transcriptCanvas.y);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  };

  const drawUserMarker = (
    ctx: CanvasRenderingContext2D,
    marker: Point,
    width: number,
    height: number
  ) => {
    const point = quadrantToCanvas(marker, width, height, PADDING);

    // Add drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Solid orange circle
    ctx.fillStyle = '#FF492C';
    ctx.beginPath();
    ctx.arc(point.x, point.y, MARKER_RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (simplified) {
      // In simplified mode, any click starts dragging
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);
      // Immediately move marker to click position
      const newPosition = canvasToQuadrant(x, y, canvasWidth, CANVAS_HEIGHT, PADDING);
      onMarkerMove(newPosition);
    } else {
      // In normal mode, check if clicking near the marker
      const markerCanvas = quadrantToCanvas(markerPosition, canvasWidth, CANVAS_HEIGHT, PADDING);
      const distance = Math.sqrt(
        Math.pow(x - markerCanvas.x, 2) + Math.pow(y - markerCanvas.y, 2)
      );

      if (distance <= MARKER_RADIUS + 5) {
        setIsDragging(true);
        canvas.setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPosition = canvasToQuadrant(x, y, canvasWidth, CANVAS_HEIGHT, PADDING);
    onMarkerMove(newPosition);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {/* HTML Labels */}
      <div className={`absolute inset-0 pointer-events-none text-xs ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {/* Top label */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2">Strategic</div>

        {/* Bottom label */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2">Tactical</div>

        {/* Left label */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90">Technical</div>

        {/* Right label */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 -rotate-90">Business</div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`rounded-lg cursor-pointer touch-none ${
          theme === 'dark' ? 'border border-gray-600' : 'border border-gray-200'
        }`}
        style={{
          width: `${canvasWidth}px`,
          height: `${CANVAS_HEIGHT}px`,
          touchAction: 'none'
        }}
      />
      {!simplified && (
        <div className={`mt-2 text-xs text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Drag the orange marker to explore different perspectives
        </div>
      )}
    </div>
  );
}
