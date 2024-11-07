import jwt from "jsonwebtoken";
import Note from "../../models/NoteModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface JwtPayload {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find note and verify ownership
    const note = await Note.findById(params.id);
    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    if (note.owner.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Not authorized to delete this note" },
        { status: 403 }
      );
    }

    // Delete the note
    await Note.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error deleting note", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json();

    const note = await Note.findById(params.id);
    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    if (note.owner.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Not authorized to update this note" },
        { status: 403 }
      );
    }

    // Update all fields
    const updatedNote = await Note.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        content: body.content,
        color: body.color,
        listId: body.listId,
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error updating note", error: errorMessage },
      { status: 500 }
    );
  }
}
