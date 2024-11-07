import connectDB from "../../lib/db";
import  ListModel  from "@/app/api/models/ListModel";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const listId = params.id;

    const deletedList = await ListModel.findByIdAndDelete(listId);
    if (!deletedList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
} 