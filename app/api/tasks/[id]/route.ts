import { NextResponse } from "next/server";
import TaskModel from "../../models/TaskModel";
import connectDB from "../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const task = await TaskModel.findOne({
      _id: params.id,
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectDB();

    const task = await TaskModel.findOneAndUpdate(
      { _id: params.id },
      { $set: body },
      { new: true }
    );

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const task = await TaskModel.findOneAndDelete({
      _id: params.id,
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}