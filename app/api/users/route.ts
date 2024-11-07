import jwt from "jsonwebtoken";
import User from "../models/UsersModel";
import { NextResponse } from "next/server";

// Register new user
export async function POST(request) {
  if (request.nextUrl.pathname === "/api/users/register") {
    try {
      const { username, password } = await request.json();

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 }
        );
      }

      const user = new User({ username, password });
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      return NextResponse.json({ token, userId: user._id }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: "Error creating user", error: error.message },
        { status: 500 }
      );
    }
  }

  if (request.nextUrl.pathname === "/api/users/login") {
    try {
      const { username, password } = await request.json();

      const user = await User.findOne({ username });
      if (!user) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      return NextResponse.json({ token, userId: user._id });
    } catch (error) {
      return NextResponse.json(
        { message: "Error logging in", error: error.message },
        { status: 500 }
      );
    }
  }
}

// Get user profile
export async function GET(request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("lists")
      .populate("notes");

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching profile", error: error.message },
      { status: 500 }
    );
  }
}
