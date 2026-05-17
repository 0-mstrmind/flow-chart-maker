import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { generateDiagram, editDiagram } from "../utils/llm.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const generateFlow = asyncHandler(
  async (req: Request, res: Response) => {
    const { userPrompt } = req.query;

    if (!userPrompt) {
      return new ApiError(400, "userPrompt is required!!");
    }

    const mermaid = await generateDiagram(decodeURIComponent(String(userPrompt)));

    return new ApiResponse({
      statusCode: 200,
      message: "Flow generated successfully!",
      data: mermaid,
    }).send(res);
  }
);

export const editFlow = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentMermaid, editInstruction } = req.body;

    if (!currentMermaid || !editInstruction) {
      return new ApiError(
        400,
        "Both currentMermaid and editInstruction are required!"
      );
    }

    const updated = await editDiagram(
      String(currentMermaid),
      String(editInstruction)
    );

    return new ApiResponse({
      statusCode: 200,
      message: "Diagram edited successfully!",
      data: updated,
    }).send(res);
  }
);
