import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token is required' 
      }, { status: 400 });
    }

    const verification = verifyMagicToken(token);
    
    if (!verification.valid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired login link. Please request a new one.' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      clientId: verification.clientId,
      email: verification.email 
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error. Please try again.' 
    }, { status: 500 });
  }
}