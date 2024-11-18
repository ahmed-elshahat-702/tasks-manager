import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, message: "No token found" },
        { status: 401 }
      );
    }

    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    try {
      jwt.verify(token.value, secret);
      return NextResponse.json(
        { isAuthenticated: true, message: "Valid token" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { isAuthenticated: false, message: "Invalid token", error },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        isAuthenticated: false,
        message: "Authentication check failed",
        error: error,
      },
      { status: 500 }
    );
  }
}
