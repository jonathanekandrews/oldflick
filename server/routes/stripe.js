import express from 'express';
import Stripe from 'stripe';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: userId.toString() }
      });
      customerId = customer.id;
      
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'https://oldflick.com'}/account?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://oldflick.com'}/account?canceled=true`,
      metadata: {
        user_id: userId.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user || !user.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'https://oldflick.com'}/account`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const customerId = session.customer;

        await pool.query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, userId]
        );
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const userResult = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [customerId]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const status = subscription.status === 'active' ? 'active' : subscription.status;
          const endDate = new Date(subscription.current_period_end * 1000);

          await pool.query(
            `UPDATE users 
             SET subscription_status = $1,
                 subscription_end_date = $2,
                 stripe_subscription_id = $3,
                 updated_date = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [status, endDate, subscription.id, userId]
          );

          console.log(`Updated subscription for user ${userId}: ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const userResult = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [customerId]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          await pool.query(
            `UPDATE users 
             SET subscription_status = 'expired',
                 stripe_subscription_id = NULL,
                 updated_date = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId]
          );

          console.log(`Subscription canceled for user ${userId}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (invoice.billing_reason === 'subscription_cycle') {
          const userResult = await pool.query(
            'SELECT id FROM users WHERE stripe_customer_id = $1',
            [customerId]
          );

          if (userResult.rows.length > 0) {
            console.log(`Invoice paid for customer ${customerId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const userResult = await pool.query(
          'SELECT id FROM users WHERE stripe_customer_id = $1',
          [customerId]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          console.error(`Payment failed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
