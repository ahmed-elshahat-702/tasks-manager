import { NextResponse } from "next/server";
import TaskModel from "../../models/TaskModel";
import connectDB from "../../lib/db";

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     await connectDB();
//     const { id: taskId } = await params;

//     const task = await TaskModel.findOne({
//       _id: taskId,
//     });

//     if (!task) {
//       return new NextResponse("Task not found", { status: 404 });
//     }

//     return NextResponse.json(task);
//   } catch (error) {
//     console.error("[TASK_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    await connectDB();
    const { id: taskId } = await params;

    // Handle empty or "no-list" listId
    if (body.listId === "" || body.listId === "no-list") {
      body.listId = null;
    }

    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $set: body },
      { new: true }
    );

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse(`Internal error: ${error}`, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: taskId } = await params;

    const task = await TaskModel.findOneAndDelete({
      _id: taskId,
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse(`Internal error: ${error}`, { status: 500 });
  }
}
