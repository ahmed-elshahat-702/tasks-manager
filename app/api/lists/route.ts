import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import List from "../models/ListModel";
import connectDB from "../lib/db";

interface JwtPayload {
  userId: string;
}

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const lists = await List.find({ owner: decoded.userId })
      .lean()
      .select("title color _id")
      .exec();

    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch lists", error: error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json(
        { message: "List title is required" },
        { status: 400 }
      );
    }

    const list = new List({
      title: data.title,
      color: data.color,
      owner: decoded.userId,
    });

    const savedList = await list.save();
    return NextResponse.json(savedList, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create list", error: error },
      { status: 500 }
    );
  }
}
