import { Request, Response } from 'express';

import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { getBoardAccess } from '@services/boardAccess.service';

import { BoardService } from './board.service';

const boardService = new BoardService();

const formatBoardResponse = async (
  board: Awaited<ReturnType<BoardService['getBoardById']>>,
  userId?: string,
  isAnonymous = false,
) => {
  const boardJson = board.toJSON ? board.toJSON() : board;
  const access = await getBoardAccess(userId ?? '', isAnonymous, boardJson.id);

  return {
    ...boardJson,
    shapes: board.shapes ?? [],
    canEdit: access?.canEdit ?? false,
    canView: access?.canView ?? false,
  };
};

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.createBoard(req.user!.id, req.body);
  res.status(201).json(ApiResponse.created(board, 'Board created successfully'));
});

export const getWorkspaceBoards = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const boards = await boardService.getWorkspaceBoards(req.params.id, search);
  res.status(200).json(ApiResponse.success(boards));
});

export const getStarredBoards = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const boards = await boardService.getStarredBoards(req.user!.id, search);
  res.status(200).json(ApiResponse.success(boards));
});

export const getRecentBoards = asyncHandler(async (req: Request, res: Response) => {
  const boards = await boardService.getRecentBoards(req.user!.id);
  res.status(200).json(ApiResponse.success(boards));
});

export const getBoardById = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.getBoardById(req.params.id, req.user?.id);
  const payload = await formatBoardResponse(
    board,
    req.user?.id,
    !!req.user?.isAnonymous,
  );
  res.status(200).json(ApiResponse.success(payload));
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
  res.status(200).json(ApiResponse.success(board));
});

export const saveVersion = asyncHandler(async (req: Request, res: Response) => {
  const { versionName, shapes } = req.body;
  if (!versionName || !shapes) {
    res.status(400);
    throw new Error('versionName and shapes are required');
  }
  const version = await boardService.saveVersion(req.params.id, req.user!.id, versionName, shapes);
  res.status(201).json(ApiResponse.success(version, 'Version saved successfully'));
});

export const getVersions = asyncHandler(async (req: Request, res: Response) => {
  const versions = await boardService.getVersions(req.params.id);
  res.status(200).json(ApiResponse.success(versions));
});

export const restoreVersion = asyncHandler(async (req: Request, res: Response) => {
  const version = await boardService.restoreVersion(req.params.id, req.params.versionId);
  res.status(200).json(ApiResponse.success(version, 'Version restored successfully'));
});
