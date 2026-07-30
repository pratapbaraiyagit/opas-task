import { Request, Response } from 'express';

import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';

import { BoardService } from './board.service';

const boardService = new BoardService();

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.createBoard(req.user!.id, req.body);
  res.status(201).json(ApiResponse.created(board, 'Board created successfully'));
});

export const getWorkspaceBoards = asyncHandler(async (req: Request, res: Response) => {
  const boards = await boardService.getWorkspaceBoards(req.params.id);
  res.status(200).json(ApiResponse.success(boards));
});

export const getStarredBoards = asyncHandler(async (req: Request, res: Response) => {
  const boards = await boardService.getStarredBoards(req.user!.id);
  res.status(200).json(ApiResponse.success(boards));
});

export const getBoardById = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.getBoardById(req.params.id, req.user?.id);
  res.status(200).json(ApiResponse.success(board));
});

export const updateBoard = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.updateBoard(req.params.id, req.body);
  res.status(200).json(ApiResponse.success(board, 'Board updated successfully'));
});

export const deleteBoard = asyncHandler(async (req: Request, res: Response) => {
  await boardService.deleteBoard(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Board deleted successfully'));
});

export const toggleStar = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.toggleStar(req.params.id, req.user!.id);
  res.status(200).json(ApiResponse.success(board, 'Board star updated'));
});
