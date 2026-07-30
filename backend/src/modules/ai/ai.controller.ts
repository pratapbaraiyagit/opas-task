import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';

export const generateActionItems = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400);
    throw new Error('Content is required to generate action items');
  }

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Try to find explicit action items if the user wrote "TODO:" or "Action:"
  const lines = content.split('\n');
  const extractedItems = lines
    .filter(line => /^(TODO|Action):?/i.test(line.trim()) || line.trim().startsWith('- [ ]'))
    .map(line => line.replace(/^(TODO|Action):?\s*/i, '').replace(/^- \[ \]\s*/, '').trim());

  let actionItems: string[];
  
  if (extractedItems.length > 0) {
    actionItems = extractedItems;
  } else {
    // Fallback mock items
    actionItems = [
      'Schedule follow-up meeting to review progress',
      'Update project documentation with new requirements',
      'Share final design assets with the engineering team'
    ];
  }

  res.status(200).json(ApiResponse.success({ actionItems }, 'Action items generated successfully'));
});
