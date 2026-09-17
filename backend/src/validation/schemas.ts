import { z } from 'zod';

export const LoginSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, 'Access code must be at least 6 characters')
    .max(10, 'Access code cannot exceed 10 characters')
    .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, '')),
});

export const CreateEntrySchema = z
  .object({
    category: z.enum(['note', 'event', 'fee', 'general']),
    recipientScope: z.enum(['whole_class', 'individual', 'group']),
    recipientIds: z.array(z.string()).default([]),
    title: z
      .string()
      .trim()
      .min(2, 'Title must be at least 2 characters')
      .max(120, 'Title cannot exceed 120 characters'),
    body: z
      .string()
      .trim()
      .min(1, 'Body is required')
      .max(600, 'Body cannot exceed 600 characters'),
    dueDate: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    attachmentUrl: z.string().url('Invalid attachment URL').optional(),
  })
  .refine(
    (data) => {
      if (
        data.recipientScope !== 'whole_class' &&
        (!data.recipientIds || data.recipientIds.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'recipientIds are required when recipientScope is not whole_class',
      path: ['recipientIds'],
    }
  );

export const ReadingLogSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  book: z.string().trim().max(100).optional(),
  minutes: z.coerce.number().min(1).max(300).default(20),
});

export const TimelineQuerySchema = z.object({
  childId: z.string().min(1, 'childId parameter is required'),
  filter: z.enum(['all', 'fee', 'event', 'note', 'general']).default('all'),
  search: z.string().optional(),
});

export const PayFeeSchema = z.object({
  paymentReference: z.string().optional(),
});
