import express, { type Router } from "express";
import { generateFlow, editFlow } from "../controllers/prompt.controllers.js";

const promptRouter: Router = express.Router();

promptRouter.get("/generate-flow", generateFlow);
promptRouter.post("/edit-flow", editFlow);

export default promptRouter;