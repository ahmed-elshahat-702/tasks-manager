import jwt from "jsonwebtoken";
import Task from "../models/TaskModel";
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

    const tasks = await Task.find({ owner: decoded.userId })
      .lean()
      .select("title date time subtask listId completed createdAt updatedAt")
      .exec();

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch Tasks", error: error },
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

    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { message: "Title are required" },
        { status: 400 }
      );
    }

    // check if already existed title
    const existingTask = await Task.findOne({ title: data.title });
    if (existingTask) {
      return NextResponse.json(
        { message: "Task with this title already exists" },
        { status: 400 }
      );
    }

    // Create the task with explicit type checking
    const task = new Task({
      title: data.title,
      date: data.date,
      time: data.time,
      subtasks: data.subtasks,
      completed: data.completed,
      listId: data.listId,
      owner: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the task with better error handling
    const savedTask = await task.save();
    if (!savedTask) {
      throw new Error("Failed to save task");
    }

    try {
      // Add task to user's tasks array with error handling
      const updatedTask = await User.findByIdAndUpdate(
        decoded.userId,
        {
          $push: {
            tasks: {
              _id: savedTask._id,
              title: savedTask.title,
              date: savedTask.date,
              time: savedTask.time,
              completed: savedTask.completed,
              subtasks: savedTask.subtasks,
              listId: savedTask.listId,
            },
          },
        },
        { new: true }
      );

      if (!updatedTask) {
        throw new Error("User not found");
      }
    } catch (userError) {
      // If user update fails, delete the saved task to maintain consistency
      await Task.findByIdAndDelete(savedTask._id);

      throw new Error(
        `Failed to update user: ${
          userError instanceof Error ? userError.message : "Unknown error"
        }`
      );
    }

    return NextResponse.json(savedTask, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating task", error: errorMessage },
      { status: 500 }
    );
  }
}
