/**
 * Utility to extract user-friendly error messages from canister/agent errors
 */

export function extractCanisterError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object with a message
  if (error instanceof Error) {
    const message = error.message;

    // Try to extract the actual error message from canister trap/reject
    // Pattern 1: "Call failed: ... Reject text: <actual message>"
    const rejectMatch = message.match(/Reject text:\s*(.+?)(?:\n|$)/i);
    if (rejectMatch && rejectMatch[1]) {
      return rejectMatch[1].trim();
    }

    // Pattern 2: "Canister trapped: <actual message>"
    const trapMatch = message.match(/Canister trapped:\s*(.+?)(?:\n|$)/i);
    if (trapMatch && trapMatch[1]) {
      return trapMatch[1].trim();
    }

    // Pattern 3: Direct trap message in the error
    const directTrapMatch = message.match(/trapped explicitly:\s*(.+?)(?:\n|$)/i);
    if (directTrapMatch && directTrapMatch[1]) {
      return directTrapMatch[1].trim();
    }

    // Return the full message if no pattern matched
    return message;
  }

  // If it's an object with a message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    if (typeof errorObj.message === 'string') {
      const message = errorObj.message;
      
      // Apply same pattern matching
      const rejectMatch = message.match(/Reject text:\s*(.+?)(?:\n|$)/i);
      if (rejectMatch && rejectMatch[1]) {
        return rejectMatch[1].trim();
      }

      const trapMatch = message.match(/Canister trapped:\s*(.+?)(?:\n|$)/i);
      if (trapMatch && trapMatch[1]) {
        return trapMatch[1].trim();
      }

      const directTrapMatch = message.match(/trapped explicitly:\s*(.+?)(?:\n|$)/i);
      if (directTrapMatch && directTrapMatch[1]) {
        return directTrapMatch[1].trim();
      }

      return message;
    }

    // Try to stringify the object as last resort
    try {
      return JSON.stringify(error);
    } catch {
      return 'An error occurred';
    }
  }

  return 'An unknown error occurred';
}
