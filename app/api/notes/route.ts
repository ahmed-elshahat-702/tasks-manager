import jwt from "jsonwebtoken";
import Note from "../models/NoteModel";
import { NextResponse } from "next/server";
import User from "../models/UsersModel";
import { cookies } from "next/headers";
import connectDB from "../lib/db";

interface JwtPayload {
  userId: string;
}

// Get all notes for the authenticated user
export async function GET() {
  try {
    await connectDB();
    const cookiesStore = await cookies();
    const token = cookiesStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const notes = await Note.find({ owner: decoded.userId })
      .lean()
      .select("title content color listId createdAt updatedAt")
      .exec();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Notes fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create a new note for the authenticated user
export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create the note with explicit type checking
    const note = new Note({
      title: data.title,
      content: data.content,
      color: data.color,
      listId: data.listId,
      owner: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the note with better error handling
    const savedNote = await note.save();
    if (!savedNote) {
      throw new Error("Failed to save note");
    }

    try {
      // Add note to user's notes array with error handling
      const updatedUser = await User.findByIdAndUpdate(
        decoded.userId,
        {
          $push: {
            notes: {
              _id: savedNote._id,
              title: savedNote.title,
              content: savedNote.content,
              color: savedNote.color,
              listId: savedNote.listId,
            },
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }
    } catch (userError) {
      // If user update fails, delete the saved note to maintain consistency
      await Note.findByIdAndDelete(savedNote._id);
      throw new Error(
        `Failed to update user: ${
          userError instanceof Error ? userError.message : "Unknown error"
        }`
      );
    }

    return NextResponse.json(savedNote, { status: 201 });
  } catch (error) {
    console.error("Note creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating note", error: errorMessage },
      { status: 500 }
    );
  }
}
