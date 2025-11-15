import { Router } from 'express';
import { insertEventSchema, events, userBlocks } from '@shared/schema';
import { isAuthenticated } from '../auth';
import { storage } from '../storage-optimized';
import { db } from '../db';
import { desc, not, inArray, eq, isNull, and, gte } from 'drizzle-orm';
import { sql as sqlTag } from 'drizzle-orm';

const router = Router();

function getSessionUserId(req: any): number | undefined {
  const raw = req.session?.userId;
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number') return raw;
  const n = parseInt(String(raw));
  return Number.isFinite(n) ? n : undefined;
}

// PERFORMANCE FIX: Use database-level filtering instead of loading all events into memory
router.get('/api/events', async (req, res) => {
  try {
    const filter = req.query.filter as string;
    const userId = getSessionUserId(req);
    const limit = parseInt(req.query.limit as string) || 100;

    // Try database-backed query first (more efficient)
    if (db) {
      try {
        // Get blocked user IDs if user is logged in
        let blockedIds: number[] = [];
        if (userId) {
          const blockedRows = await db
            .select({ blockedId: userBlocks.blockedId })
            .from(userBlocks)
            .where(eq(userBlocks.blockerId, userId));
          blockedIds = blockedRows.map(r => r.blockedId).filter((v): v is number => typeof v === 'number');
        }

        // Build where clauses
        const whereClauses = [
          isNull(events.deletedAt), // Exclude deleted events
        ];

        // Filter out blocked users' events
        if (blockedIds.length > 0) {
          whereClauses.push(not(inArray(events.creatorId, blockedIds)));
        }

        // Execute optimized query
        const result = await db
          .select()
          .from(events)
          .where(and(...whereClauses))
          .orderBy(desc(events.createdAt))
          .limit(limit);

        return res.json(result);
      } catch (dbErr) {
        console.warn('Database query for events failed, falling back to storage:', dbErr);
      }
    }

    // Fallback to storage-based implementation
    let eventsList = await storage.getAllEvents();
    if (userId) {
      const blockedIds = await storage.getBlockedUserIdsFor(userId);
      if (blockedIds && blockedIds.length > 0) {
        eventsList = eventsList.filter((e: any) => !blockedIds.includes(e.creatorId));
      }
    }
    res.json(eventsList.slice(0, limit));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/api/events/public', async (_req, res) => {
  try {
    const limit = parseInt(_req.query.limit as string) || 100;

    // Try database-backed query first
    if (db) {
      try {
        const result = await db
          .select()
          .from(events)
          .where(
            and(
              eq(events.isPublic, true),
              isNull(events.deletedAt)
            )
          )
          .orderBy(desc(events.createdAt))
          .limit(limit);

        return res.json(result);
      } catch (dbErr) {
        console.warn('Database query for public events failed, falling back to storage:', dbErr);
      }
    }

    // Fallback
    const allEvents = await storage.getAllEvents();
    const publicEvents = allEvents.filter((event: any) => event.isPublic).slice(0, limit);
    res.json(publicEvents);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ message: 'Error fetching public events' });
  }
});

router.get('/api/events/upcoming', async (_req, res) => {
  try {
    const limit = parseInt(_req.query.limit as string) || 100;
    const now = new Date();
    const todayStart = new Date(now.toDateString());

    // Try database-backed query first
    if (db) {
      try {
        const result = await db
          .select()
          .from(events)
          .where(
            and(
              isNull(events.deletedAt),
              gte(events.eventDate, todayStart)
            )
          )
          .orderBy(events.eventDate) // Ascending for upcoming events
          .limit(limit);

        return res.json(result);
      } catch (dbErr) {
        console.warn('Database query for upcoming events failed, falling back to storage:', dbErr);
      }
    }

    // Fallback
    const all = await storage.getAllEvents();
    const upcoming = all
      .filter((e: any) => !e.deletedAt && new Date(e.eventDate) >= todayStart)
      .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, limit);
    res.json(upcoming);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Error fetching upcoming events' });
  }
});

router.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await storage.getEvent(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Accept minimal payload: title, description, startsAt (ISO), optional isPublic
router.post('/api/events', isAuthenticated, async (req, res) => {
  try {
    const userId = getSessionUserId(req)!;
    const { title, description, startsAt, isPublic } = req.body || {};
    if (!title || !description || !startsAt) return res.status(400).json({ message: 'title, description, startsAt required' });

    const start = new Date(startsAt);
    if (isNaN(start.getTime()) || start.getTime() <= Date.now()) return res.status(400).json({ message: 'startsAt must be in the future' });

    // Map minimal to schema fields
    const payload = {
      title,
      description,
      isPublic: !!isPublic,
      eventDate: start.toISOString().slice(0, 10), // YYYY-MM-DD
      startTime: start.toISOString().slice(11, 19), // HH:MM:SS
      endTime: start.toISOString().slice(11, 19),
      creatorId: userId,
    };

    const validated = insertEventSchema.parse(payload as any);
    const event = await storage.createEvent(validated);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.delete('/api/events/:id', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = getSessionUserId(req)!;
    const ev = await storage.getEvent(eventId);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    if (ev.creatorId !== userId) return res.status(403).json({ message: 'Only creator can delete event' });

    const ok = await storage.deleteEvent(eventId);
    if (!ok) return res.status(404).json({ message: 'Event not found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

export default router;
