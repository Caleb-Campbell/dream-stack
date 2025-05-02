import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";

import { api } from "~/utils/api";
import { env } from "~/env";

import "~/styles/globals.css";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  // Function to fetch the client secret from our API route
  const fetchClientSecret = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // You might need to pass relevant data here to create the session
        // e.g., items in cart, user ID, etc.
        // body: JSON.stringify({ items: [...] })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Explicitly type the response data
      const data = (await response.json()) as { clientSecret?: string };
      if (!data.clientSecret) {
        throw new Error('Client secret not found in response');
      }
      return data.clientSecret;
    } catch (error) {
      console.error("Failed to fetch client secret:", error);
      // Re-throw the error so the Promise rejects as expected by CheckoutProvider
      throw error;
    }
  };

  const options = {
    fetchClientSecret,
    // Define appearance, loader, etc. as needed
    // appearance: { theme: 'stripe' },
    // loader: 'auto'
  };

  return (
    <SessionProvider session={session}>
      <CheckoutProvider stripe={stripePromise} options={options}>
        <div className={geist.className}>
          <Component {...pageProps} />
        </div>
      </CheckoutProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
