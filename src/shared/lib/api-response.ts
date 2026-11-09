import { NextResponse } from "next/server";
import { AppError } from "@/shared/errors/app.error";

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

  return NextResponse.json(
    {
      error: "Internal server error",
      status: 500,
      statusCode: "ERROR",
    },
    { status: 500 },
  );
}
