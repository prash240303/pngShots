import { NextResponse } from 'next/server';
import { getAppNames } from '@/lib/imagekit';

export async function GET() {
  try {
    const images = await getAppNames();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}