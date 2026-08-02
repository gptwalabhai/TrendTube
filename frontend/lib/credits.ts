import { query } from './db';

export const SEARCH_CREDIT_COST = 500;
export const UPLOAD_CREDIT_COST = 1000;
export const INITIAL_USER_CREDITS = 10000;

export interface CreditTransaction {
  userId: string;
  amount: number; // positive for additions, negative for deductions
  actionType: 'signup_bonus' | 'search_deduction' | 'upload_deduction' | 'admin_add' | 'admin_deduct';
  description: string;
}

/**
 * Deducts credits from user balance atomically if sufficient balance exists.
 * Returns true if successful, false if insufficient credits.
 */
export async function deductCredits(
  userId: string,
  cost: number,
  actionType: 'search_deduction' | 'upload_deduction',
  description: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    // Fetch current user credits and status
    const userRes = await query(`SELECT credits, is_banned FROM Users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = userRes.rows[0];
    if (user.is_banned) {
      return { success: false, error: 'User account is suspended' };
    }

    if (user.credits < cost) {
      return {
        success: false,
        error: `Insufficient credits. Action requires ${cost} credits, but you have ${user.credits} credits remaining.`
      };
    }

    // Atomic update
    const updateRes = await query(
      `UPDATE Users 
       SET credits = credits - $1, 
           updated_at = NOW(),
           searches_count = CASE WHEN $2 = 'search_deduction' THEN searches_count + 1 ELSE searches_count END,
           uploads_count = CASE WHEN $2 = 'upload_deduction' THEN uploads_count + 1 ELSE uploads_count END
       WHERE id = $3 AND credits >= $1
       RETURNING credits`,
      [cost, actionType, userId]
    );

    if (updateRes.rows.length === 0) {
      return { success: false, error: 'Insufficient credits or concurrency update failure' };
    }

    const newBalance = updateRes.rows[0].credits;

    // Log transaction history
    await query(
      `INSERT INTO CreditHistory (user_id, amount, action_type, description) VALUES ($1, $2, $3, $4)`,
      [userId, -cost, actionType, description]
    );

    return { success: true, newBalance };
  } catch (err: any) {
    console.error('Credit deduction error:', err);
    return { success: false, error: err.message || 'Database error during credit deduction' };
  }
}

/**
 * Adds credits to user account (e.g. signup bonus or admin grant)
 */
export async function addCredits(
  userId: string,
  amount: number,
  actionType: 'signup_bonus' | 'admin_add',
  description: string
): Promise<{ success: boolean; newBalance?: number }> {
  try {
    const updateRes = await query(
      `UPDATE Users SET credits = credits + $1, updated_at = NOW() WHERE id = $2 RETURNING credits`,
      [amount, userId]
    );

    if (updateRes.rows.length === 0) {
      return { success: false };
    }

    const newBalance = updateRes.rows[0].credits;

    await query(
      `INSERT INTO CreditHistory (user_id, amount, action_type, description) VALUES ($1, $2, $3, $4)`,
      [userId, amount, actionType, description]
    );

    return { success: true, newBalance };
  } catch (err: any) {
    console.error('Credit addition error:', err);
    return { success: false };
  }
}

/**
 * Retrieves credit history transactions for a user
 */
export async function getCreditHistory(userId: string) {
  const res = await query(
    `SELECT id, amount, action_type, description, created_at 
     FROM CreditHistory 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );
  return res.rows;
}
