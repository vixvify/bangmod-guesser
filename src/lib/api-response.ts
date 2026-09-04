import { NextResponse } from "next/server";
import { AppError } from "@/core/errors/app.error";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      data,
      status,
      statusCode: status === 201 ? "CREATED" : "SUCCESS",
    },
    { status },
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        status: error.status,
        statusCode: "ERROR",
      },
      { status: error.status },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: "Invalid JSON payload",
        status: 400,
        statusCode: "ERROR",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error: "Internal server error",
      status: 500,
      statusCode: "ERROR",
    },
    { status: 500 },
  );
}
