import jwt from "jsonwebtoken";
import ListModel from "../../models/ListModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface JwtPayload {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // Find list and verify ownership
    const { id: listId } = await params;
    const list = await ListModel.findById(listId);
    if (!list) {
      return NextResponse.json({ message: "list not found" }, { status: 404 });
    }

    if (list.owner.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Not authorized to delete this list" },
        { status: 403 }
      );
    }

    // Delete the list
    await ListModel.findByIdAndDelete(listId);

    return NextResponse.json({ message: "list deleted successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error deleting list", error: errorMessage },
      { status: 500 }
    );
  }
}
