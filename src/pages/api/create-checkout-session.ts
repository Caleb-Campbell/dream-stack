import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { env } from '~/env';

// Initialize Stripe with the secret key
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Define a basic line item for the checkout session
      // TODO: Replace with actual product/price information
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Example Product',
            },
            unit_amount: 1000, // Amount in cents (e.g., $10.00)
          },
          quantity: 1,
        },
      ];

      // Define the base URL for the return URL
      // Use NEXTAUTH_URL from env, fallback to localhost for local dev if not set
      const returnBaseUrl = env.NEXTAUTH_URL || 'http://localhost:3000';
      // TODO: Update the success/cancel paths as needed
      const returnUrl = `${returnBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: lineItems,
        mode: 'payment', // Use 'subscription' for recurring payments
        return_url: returnUrl,
        // If you need to collect address information:
        // billing_address_collection: 'required',
        // shipping_address_collection: {
        //   allowed_countries: ['US', 'CA'], // Example countries
        // },
      });

      res.status(200).json({ clientSecret: session.client_secret });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ statusCode: 500, message: errorMessage });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
} 