import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { prompt } from "../utils/llm.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const generateFlow = asyncHandler(
  async (req: Request, res: Response) => {
    const { userPrompt } = req.query;
    
    if (!userPrompt) {
      return new ApiError(400, "userPrompt is required!!");
    }
    
    const llmResponse = await prompt(decodeURIComponent(String(userPrompt)));
    
    
    
    return new ApiResponse({
      statusCode: 200,
      message: "Flow generated successfully!",
      data: llmResponse,
    }).send(res);
  },
);
