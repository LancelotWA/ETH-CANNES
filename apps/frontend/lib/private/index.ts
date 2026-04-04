/**
 * Private transaction layer — Phase 3 (Unlink ZK).
 *
 * This module will mirror the public layer API shape:
 *   - sendPrivatePayment(to, amount, note)
 *   - getPrivateHistory(viewingKey)
 *   - sendPrivateReaction(...)
 *
 * NOT IMPLEMENTED — placeholder for architectural separation.
 */

export function sendPrivatePayment(): never {
  throw new Error("Private payments (Unlink ZK) are not yet implemented — Phase 3");
}

export function getPrivateHistory(): never {
  throw new Error("Private history is not yet implemented — Phase 3");
}

export function sendPrivateReaction(): never {
  throw new Error("Private reactions are not yet implemented — Phase 3");
}
