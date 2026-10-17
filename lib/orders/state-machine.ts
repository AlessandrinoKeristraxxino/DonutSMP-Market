/**
 * Pure Order State Machine for Donut SMP Marketplace.
 *
 * Rules:
 * - Statuses: REQUESTED -> ACCEPTED -> IN_PROGRESS -> DELIVERED -> COMPLETED
 * - Plus CANCELLED and DISPUTED.
 * - Seller accepts, starts, and marks delivery.
 * - Buyer confirms completion.
 * - Either party can cancel before DELIVERED.
 * - Either party can open a DISPUTE.
 * - Moderator or Admin can resolve a dispute to COMPLETED or CANCELLED.
 */

export type OrderStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type OrderAction =
  | 'ACCEPT'
  | 'START'
  | 'DELIVER'
  | 'COMPLETE'
  | 'CANCEL'
  | 'DISPUTE'
  | 'RESOLVE_COMPLETE'
  | 'RESOLVE_CANCEL';

export type PartyRole = 'BUYER' | 'SELLER' | 'MOD' | 'ADMIN';

export interface TransitionRule {
  from: OrderStatus[];
  to: OrderStatus;
  allowedRoles: PartyRole[];
  description: string;
}

export const TRANSITION_RULES: Record<OrderAction, TransitionRule> = {
  ACCEPT: {
    from: ['REQUESTED'],
    to: 'ACCEPTED',
    allowedRoles: ['SELLER'],
    description: 'Seller accepts the order terms.',
  },
  START: {
    from: ['ACCEPTED'],
    to: 'IN_PROGRESS',
    allowedRoles: ['SELLER'],
    description: 'Seller begins assembling items, painting maps, or building.',
  },
  DELIVER: {
    from: ['IN_PROGRESS', 'ACCEPTED'],
    to: 'DELIVERED',
    allowedRoles: ['SELLER'],
    description: 'Seller has dropped items/maps in-game at spawn or completed build.',
  },
  COMPLETE: {
    from: ['DELIVERED'],
    to: 'COMPLETED',
    allowedRoles: ['BUYER'],
    description: 'Buyer inspects delivery in-game and confirms order completion.',
  },
  CANCEL: {
    from: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'],
    to: 'CANCELLED',
    allowedRoles: ['BUYER', 'SELLER', 'MOD', 'ADMIN'],
    description: 'Either party cancels the deal prior to in-game delivery.',
  },
  DISPUTE: {
    from: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'],
    to: 'DISPUTED',
    allowedRoles: ['BUYER', 'SELLER'],
    description: 'A party flags an issue or disagreement for moderator intervention.',
  },
  RESOLVE_COMPLETE: {
    from: ['DISPUTED'],
    to: 'COMPLETED',
    allowedRoles: ['MOD', 'ADMIN'],
    description: 'Moderator resolves dispute in favor of order completion.',
  },
  RESOLVE_CANCEL: {
    from: ['DISPUTED'],
    to: 'CANCELLED',
    allowedRoles: ['MOD', 'ADMIN'],
    description: 'Moderator resolves dispute by voiding the order.',
  },
};

/**
 * Validates whether a transition action is permissible given current status and actor role.
 */
export function canTransition(
  currentStatus: OrderStatus,
  action: OrderAction,
  actorRole: PartyRole
): { allowed: boolean; reason?: string } {
  const rule = TRANSITION_RULES[action];
  if (!rule) {
    return { allowed: false, reason: `Unknown order action: ${action}` };
  }

  if (!rule.from.includes(currentStatus)) {
    return {
      allowed: false,
      reason: `Action '${action}' cannot be performed from status '${currentStatus}'. Expected: [${rule.from.join(', ')}]`,
    };
  }

  if (!rule.allowedRoles.includes(actorRole)) {
    return {
      allowed: false,
      reason: `Role '${actorRole}' is not permitted to perform action '${action}'. Required: [${rule.allowedRoles.join(', ')}]`,
    };
  }

  return { allowed: true };
}

/**
 * Returns the target status if transition is valid, throws Error otherwise.
 */
export function executeTransition(
  currentStatus: OrderStatus,
  action: OrderAction,
  actorRole: PartyRole
): OrderStatus {
  const check = canTransition(currentStatus, action, actorRole);
  if (!check.allowed) {
    throw new Error(check.reason || 'Invalid order transition');
  }
  return TRANSITION_RULES[action].to;
}

/**
 * Lists all permissible actions for a given order status and user role.
 */
export function getAvailableActions(
  currentStatus: OrderStatus,
  actorRole: PartyRole
): OrderAction[] {
  const actions: OrderAction[] = [
    'ACCEPT',
    'START',
    'DELIVER',
    'COMPLETE',
    'CANCEL',
    'DISPUTE',
    'RESOLVE_COMPLETE',
    'RESOLVE_CANCEL',
  ];

  return actions.filter((act) => canTransition(currentStatus, act, actorRole).allowed);
}

/**
 * Formats status labels and colors.
 */
export function getStatusMetadata(status: OrderStatus): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case 'REQUESTED':
      return {
        label: 'Requested',
        color: 'text-[var(--accent)]',
        description: 'Waiting for seller to review and accept terms.',
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        color: 'text-stone-300',
        description: 'Seller accepted order. Ready to commence work.',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        color: 'text-amber-400',
        description: 'Items are being gathered, maps painted, or structure built.',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        color: 'text-sky-400',
        description: 'Dropped in-game at spawn. Awaiting buyer confirmation.',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'text-[#3FB950]',
        description: 'Trade verified by both parties. Vouching unlocked.',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'text-[var(--text-muted)]',
        description: 'This deal was cancelled before delivery.',
      };
    case 'DISPUTED':
      return {
        label: 'Disputed',
        color: 'text-[#F85149]',
        description: 'Under review by server moderation staff.',
      };
  }
}
