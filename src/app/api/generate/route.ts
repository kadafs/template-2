import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY || 'your-fal-key',
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt,
        image_size: "landscape_4_3",
        num_images: 4,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg"
      },
      logs: true,
    });

    if (!result.data) {
      throw new Error('No data received from the API');
    }

    return NextResponse.json({ 
      images: result.data.images.map(image => ({
        imageUrl: image.url,
        width: image.width,
        height: image.height
      })),
      seed: result.data.seed
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
} 