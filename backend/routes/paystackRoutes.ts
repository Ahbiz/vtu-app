import express from 'express';
import * as paystackController from '../controllers/paystackController';
import { protect } from '../middleware/auth';

/**
 * [WHAT] - This is the Paystack Router.
 * [WHY] - It defines the web addresses (endpoints) that our frontend can call.
 * [HOW] - It maps specific URL paths to the functions in our controller.
 */

const router = express.Router();

/**
 * Endpoint to start a transaction.
 * We use 'protect' middleware because only logged-in users should be able to pay.
 */
router.post('/initialize', protect, paystackController.initialize);

/**
 * Endpoint to check if a specific transaction was successful.
 * The ':reference' part is a variable (placeholder) for the unique transaction ID.
 */
router.get('/verify/:reference', protect, paystackController.verify);

/**
 * Webhook Endpoint. 
 * This is NOT protected by our auth middleware because it is called by Paystack's servers, 
 * not our users. We use the 'signature' verification inside the controller instead.
 */
router.post('/webhook', paystackController.webhook);

export default router;
