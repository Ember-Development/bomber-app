import {
  EventBE,
  EventFE,
  NewEvent,
  NewEventAttendance,
} from '@bomber-app/database';
import {
  AttendanceStatus,
  EventType,
  Prisma,
} from '@bomber-app/database/generated/client';
import { prisma } from '../api';
import { sendNotificationRecord } from './notifications';

const validateEvent = (event: EventFE) => {
  const errors = [];

  if (event.eventType == EventType.GLOBAL) {
    if (event.attendees.length > 0) {
      errors.push(
        'Global events implicitly invite all users, do not track them as this will cause a huge storage issue'
      );
    }
  } else if (event.eventType == EventType.TOURNAMENT) {
    if (!event.tournamentID) {
      errors.push('Tournament event types should have a tournament relation');
    }
  }

  if (errors.length > 0) return errors;
};

export { validateEvent };

type AuthedUser = {
  id: string;
  roles: Array<
    'ADMIN' | 'COACH' | 'REGIONAL_COACH' | 'PLAYER' | 'PARENT' | 'FAN'
  >;
  primaryRole:
    | 'ADMIN'
    | 'COACH'
    | 'REGIONAL_COACH'
    | 'PLAYER'
    | 'PARENT'
    | 'FAN';
};

async function getInviteableUserIdsForCoach(
  userId: string
): Promise<Set<string>> {
  const coach = await prisma.coach.findUnique({
    where: { userID: userId },
    include: {
      teams: {
        include: {
          players: {
            select: {
              userID: true,
              isTrusted: true,
              parents: { select: { userID: true } },
            },
          },
          coaches: { select: { userID: true } },
        },
      },
      headTeams: {
        include: {
          players: {
            select: {
              userID: true,
              isTrusted: true,
              parents: { select: { userID: true } },
            },
          },
          coaches: { select: { userID: true } },
        },
      },
    },
  });
  const ids = new Set<string>();
  if (!coach) return ids;

  const allTeams = [...coach.teams, ...coach.headTeams];
  for (const t of allTeams) {
    for (const p of t.players) {
      if (p.userID) ids.add(p.userID);
      // parents of team players are implicitly in scope for coaches
      for (const par of p.parents) if (par.userID) ids.add(par.userID);
    }
    for (const c of t.coaches) if (c.userID) ids.add(c.userID);
  }
  return ids;
}

async function getInviteableUserIdsForRegionCoach(
  userId: string
): Promise<Set<string>> {
  const reg = await prisma.regCoach.findUnique({
    where: { userID: userId },
    select: { region: true },
  });
  const ids = new Set<string>();
  if (!reg) return ids;

  const teams = await prisma.team.findMany({
    where: { region: reg.region },
    include: {
      players: {
        select: {
          userID: true,
          isTrusted: true,
          parents: { select: { userID: true } },
        },
      },
      coaches: { select: { userID: true } },
    },
  });

  for (const t of teams) {
    for (const p of t.players) {
      if (p.userID) ids.add(p.userID);
      for (const par of p.parents) if (par.userID) ids.add(par.userID);
    }
    for (const c of t.coaches) if (c.userID) ids.add(c.userID);
  }
  return ids;
}

async function expandParentsForUntrustedPlayers(
  userIds: string[]
): Promise<string[]> {
  if (!userIds.length) return userIds;
  // Find any players (by userID) that are untrusted
  const players = await prisma.player.findMany({
    where: { userID: { in: userIds }, isTrusted: false },
    select: { parents: { select: { userID: true } } },
  });
  const extraParentIds = players
    .flatMap((p) => p.parents.map((par) => par.userID))
    .filter((x): x is string => !!x);

  return Array.from(new Set([...userIds, ...extraParentIds]));
}

async function expandWithParents(userIds: string[]): Promise<string[]> {
  if (!userIds.length) return [];
  // find players by userID and isTrusted=false, bring parents' userIDs
  const players = await prisma.player.findMany({
    where: { userID: { in: userIds }, isTrusted: false },
    include: {
      parents: {
        select: { userID: true },
      },
    },
  });
  const parentIds = new Set<string>();
  for (const p of players) {
    for (const par of p.parents) if (par.userID) parentIds.add(par.userID);
  }
  return Array.from(parentIds);
}

async function notifyUsers(userIds: string[], title: string, body?: string) {
  if (!userIds.length) return;
  const n = await prisma.notification.create({
    data: {
      title,
      body: body ?? '',
      status: 'draft',
      audience: { userIds }, // your resolver reads audience.userIds
      platform: 'both',
      createdAt: new Date(),
    } as any,
  });
  await prisma.notification.update({
    where: { id: n.id },
    data: { status: 'queued' },
  });
  await sendNotificationRecord(n.id);
}

export const eventService = {
  getAllEvents: async () => {
    return prisma.event.findMany({
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
      orderBy: { start: 'desc' },
    });
  },

  getEventById: async (id: string) => {
    return prisma.event.findUnique({
      where: { id },
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });
  },

  createEvent: async (
    currentUser: AuthedUser,
    event: NewEvent,
    attendees: NewEventAttendance[],
    tournamentID: string | null
  ) => {
    const roleSet = new Set(currentUser.roles);
    const isAdmin = roleSet.has('ADMIN');
    const isCoach = roleSet.has('COACH');
    const isReg = roleSet.has('REGIONAL_COACH');

    if (!isAdmin && !isCoach && !isReg) {
      throw Object.assign(new Error('Forbidden: insufficient role'), {
        status: 403,
      });
    }

    if (
      (isCoach || isReg) &&
      ![EventType.PRACTICE, EventType.TOURNAMENT].includes(
        event.eventType as any
      )
    ) {
      throw Object.assign(
        new Error('Only PRACTICE or TOURNAMENT allowed for this role'),
        { status: 400 }
      );
    }
    if (event.eventType === EventType.GLOBAL && !isAdmin) {
      throw Object.assign(new Error('Only ADMIN may create GLOBAL events'), {
        status: 403,
      });
    }
    if (event.eventType === EventType.GLOBAL && attendees.length > 0) {
      throw Object.assign(
        new Error(
          'Global events implicitly invite all users; do not include attendees'
        ),
        { status: 400 }
      );
    }

    // Build initial invite list from payload + ensure creator is included
    const initialIds = new Set<string>(attendees.map((a) => a.userID));
    initialIds.add(currentUser.id);

    // Expand: if any invited user is an untrusted player, auto-include their parents
    const expandedIds = await expandParentsForUntrustedPlayers(
      Array.from(initialIds)
    );

    // Scope validation (non-admin): invited must be within scope
    if (!isAdmin) {
      const allowedIds = isCoach
        ? await getInviteableUserIdsForCoach(currentUser.id)
        : await getInviteableUserIdsForRegionCoach(currentUser.id);

      const outOfScope = expandedIds.filter((id) => !allowedIds.has(id));
      if (outOfScope.length) {
        throw Object.assign(
          new Error('One or more invited users are out of your scope'),
          {
            status: 400,
            details: outOfScope,
          }
        );
      }
    }

    // Create event
    const newEvent = await prisma.event.create({
      data: {
        eventType: event.eventType,
        start: new Date(event.start),
        end: new Date(event.end),
        title: event.title,
        body: event.body,
        location: event.location,
        tournamentID,
      },
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });

    // Attendance rows (skip for GLOBAL)
    if (event.eventType !== EventType.GLOBAL) {
      // Use input statuses where provided, default creator to ATTENDING and others to PENDING
      const inputStatusByUser = new Map(
        attendees.map((a) => [a.userID, a.status])
      );
      const rows = expandedIds.map((uid) => ({
        eventID: newEvent.id,
        userID: uid,
        status:
          uid === currentUser.id
            ? AttendanceStatus.ATTENDING
            : (inputStatusByUser.get(uid) ?? AttendanceStatus.PENDING),
      }));

      await prisma.eventAttendance.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }

    // Create + send notification
    // Audience: GLOBAL -> all users; otherwise -> expandedIds
    const audience =
      event.eventType === EventType.GLOBAL
        ? { all: true }
        : { userIds: expandedIds };

    const notif = await prisma.notification.create({
      data: {
        title: newEvent.title || (newEvent.eventType as string),
        body:
          event.eventType === EventType.GLOBAL
            ? 'A new global event has been posted.'
            : 'You have been invited to a new event.',
        imageUrl: null,
        deepLink: `/event/${newEvent.id}`,
        platform: 'both',
        status: 'queued',
        scheduledAt: null,
        createdAt: new Date(),
        audience: audience as any,
        data: {
          kind: 'event_invite',
          eventId: newEvent.id,
          eventType: newEvent.eventType,
          start: newEvent.start,
          end: newEvent.end,
        } as any,
      } as any,
    });

    await sendNotificationRecord(notif.id);

    return {
      event: newEvent,
    };
  },

  // note this is only for direct fields for new events, not relationships i.e. tournaments / attendants
  updateEvent: async (id: string, data: Partial<NewEvent>) => {
    const safeUpdate: Prisma.EventUpdateInput = Object.fromEntries(
      Object.entries({
        eventType: data.eventType,
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
        title: data.title ?? undefined,
        body: data.body ?? undefined,
        location: data.location ?? undefined,
      }).filter(([, v]) => v !== undefined)
    );

    return prisma.event.update({
      where: { id },
      data: safeUpdate,
      include: {
        tournament: true,
        attendees: { include: { user: true } },
      },
    });
  },

  deleteEvent: async (id: string, currentUser?: AuthedUser) => {
    if (!currentUser) {
      console.error('[Service:deleteEvent] No user provided for event', id);
      throw Object.assign(new Error('Unauthorized: No user provided'), {
        status: 401,
      });
    }

    const roleSet = new Set(currentUser.roles);
    const isAdmin = roleSet.has('ADMIN');
    const isCoach = roleSet.has('COACH');
    const isReg = roleSet.has('REGIONAL_COACH');

    if (!isAdmin && !isCoach && !isReg) {
      console.error(
        `[Service:deleteEvent] User ${currentUser.id} has insufficient role`
      );
      throw Object.assign(new Error('Forbidden: Insufficient role'), {
        status: 403,
      });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      include: { attendees: true },
    });

    if (!event) {
      console.warn(`[Service:deleteEvent] Event not found: ${id}`);
      throw Object.assign(new Error('Event not found'), {
        status: 404,
      });
    }

    // Scope validation for non-admins
    if (!isAdmin) {
      const allowedIds = isCoach
        ? await getInviteableUserIdsForCoach(currentUser.id)
        : await getInviteableUserIdsForRegionCoach(currentUser.id);

      const attendeeIds = event.attendees.map((a) => a.userID);
      const outOfScope = attendeeIds.filter((id) => !allowedIds.has(id));
      if (outOfScope.length) {
        console.error(
          `[Service:deleteEvent] User ${currentUser.id} attempted to delete event with out-of-scope attendees:`,
          outOfScope
        );
        throw Object.assign(
          new Error('Event contains attendees out of your scope'),
          {
            status: 403,
            details: outOfScope,
          }
        );
      }
    }

    // Notify attendees of cancellation (optional)
    if (event.eventType !== EventType.GLOBAL) {
      const attendeeIds = event.attendees.map((a) => a.userID);
      await notifyUsers(
        attendeeIds,
        `Event Cancelled: ${event.title ?? event.eventType}`,
        `The event scheduled for ${new Date(event.start).toLocaleString()} has been cancelled.`
      );
    }

    // Delete attendance records and event in a transaction
    try {
      await prisma.$transaction([
        prisma.eventAttendance.deleteMany({
          where: { eventID: id },
        }),
        prisma.event.delete({
          where: { id },
        }),
      ]);
      console.log(
        `[Service:deleteEvent] Successfully deleted event ${id} by user ${currentUser.id}`
      );
      return true;
    } catch (error) {
      console.error(
        `[Service:deleteEvent] Failed to delete event ${id}:`,
        error
      );
      throw Object.assign(new Error('Failed to delete event'), {
        status: 500,
        details:
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message?: string }).message
            : String(error),
      });
    }
  },

  getEventAttendees: async (eventID: string) => {
    return prisma.eventAttendance.findMany({
      where: { eventID },
      include: { user: true, event: false },
      orderBy: { status: 'asc' },
    });
  },

  setAttendanceStatus: async ({
    eventID,
    userID,
    status,
  }: {
    eventID: string;
    userID: string;
    status: AttendanceStatus; // ATTENDING | MAYBE | DECLINED
  }) => {
    const evt = await prisma.event.findUnique({ where: { id: eventID } });
    if (!evt) throw new Error('Event not found');
    // Do not track attendees for GLOBAL (your rule)
    if (evt.eventType === EventType.GLOBAL) {
      const err = new Error('Global events do not track attendees') as any;
      err.code = 'GLOBAL_NOT_ALLOWED';
      throw err;
    }
    // Upsert based on @@unique([userID, eventID])
    return prisma.eventAttendance.upsert({
      where: { userID_eventID: { userID, eventID } },
      create: { userID, eventID, status },
      update: { status },
      include: { user: true },
    });
  },

  removeAttendance: async ({
    eventID,
    userID,
  }: {
    eventID: string;
    userID: string;
  }) => {
    // If missing, noop-success
    await prisma.eventAttendance.deleteMany({ where: { userID, eventID } });
    return true;
  },

  async addAttendeesToEvent({
    currentUser,
    eventID,
    userIds,
    status,
  }: {
    currentUser: AuthedUser;
    eventID: string;
    userIds: string[];
    status: AttendanceStatus;
  }) {
    const evt = await prisma.event.findUnique({ where: { id: eventID } });
    if (!evt)
      throw Object.assign(new Error('Event not found'), { status: 404 });

    if (evt.eventType === EventType.GLOBAL) {
      throw Object.assign(new Error('Global events do not track attendees'), {
        status: 400,
      });
    }

    const roleSet = new Set(currentUser.roles);
    const isAdmin = roleSet.has('ADMIN');
    const isCoach = roleSet.has('COACH');
    const isReg = roleSet.has('REGIONAL_COACH');

    if (!isAdmin && !isCoach && !isReg) {
      throw Object.assign(new Error('Forbidden: insufficient role'), {
        status: 403,
      });
    }

    // Scope enforcement for non-admins
    if (!isAdmin) {
      const allowedIds = isCoach
        ? await getInviteableUserIdsForCoach(currentUser.id)
        : await getInviteableUserIdsForRegionCoach(currentUser.id);

      const invalid = userIds.filter((uid) => !allowedIds.has(uid));
      if (invalid.length) {
        throw Object.assign(
          new Error('One or more invited users are out of your scope'),
          { status: 400, details: invalid }
        );
      }
    }

    // Expand with parents of untrusted players
    const parentIds = await expandWithParents(userIds);
    const allIds = Array.from(
      new Set([...userIds, ...parentIds, currentUser.id])
    ); // ensure creator included

    // Create many (skip duplicates thanks to @@unique on userID+eventID handled with createMany + skipDuplicates)
    const payload = allIds.map((uid) => ({
      eventID,
      userID: uid,
      status,
    }));

    const result = await prisma.eventAttendance.createMany({
      data: payload,
      skipDuplicates: true,
    });

    // Notify everyone newly added (rough but effective): send event title & when
    const freshUsers = allIds; // in a perfect world filter to only truly newly-created, but createMany doesn't return rows
    const when = `${evt.title ?? evt.eventType} • ${new Date(evt.start).toLocaleString()} - ${new Date(
      evt.end
    ).toLocaleString()}`;
    await notifyUsers(
      freshUsers,
      `You were invited: ${evt.title ?? evt.eventType}`,
      `${evt.location ? `${evt.location} • ` : ''}${when}`
    );

    // return updated snapshot
    const attendees = await prisma.eventAttendance.findMany({
      where: { eventID },
      include: { user: true },
      orderBy: { status: 'asc' },
    });

    return { count: result.count, attendees };
  },

  /**
   * Remove a single attendee from an event with role/scope checks.
   */
  async removeAttendeeFromEvent({
    currentUser,
    eventID,
    userID,
  }: {
    currentUser: AuthedUser;
    eventID: string;
    userID: string;
  }) {
    const evt = await prisma.event.findUnique({ where: { id: eventID } });
    if (!evt)
      throw Object.assign(new Error('Event not found'), { status: 404 });

    if (evt.eventType === EventType.GLOBAL) {
      throw Object.assign(new Error('Global events do not track attendees'), {
        status: 400,
      });
    }

    const roleSet = new Set(currentUser.roles);
    const isAdmin = roleSet.has('ADMIN');
    const isCoach = roleSet.has('COACH');
    const isReg = roleSet.has('REGIONAL_COACH');

    if (!isAdmin && !isCoach && !isReg) {
      throw Object.assign(new Error('Forbidden: insufficient role'), {
        status: 403,
      });
    }

    if (!isAdmin) {
      const allowedIds = isCoach
        ? await getInviteableUserIdsForCoach(currentUser.id)
        : await getInviteableUserIdsForRegionCoach(currentUser.id);
      if (!allowedIds.has(userID)) {
        throw Object.assign(new Error('User is out of your scope'), {
          status: 400,
        });
      }
    }

    await prisma.eventAttendance.deleteMany({
      where: { eventID, userID },
    });

    return true;
  },
};
