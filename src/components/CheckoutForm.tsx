import React from 'react';
import { useCheckout, PaymentElement } from '@stripe/react-stripe-js';

export const CheckoutForm = () => {
  const checkout = useCheckout();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!checkout) {
      // Checkout.js hasn't loaded yet. Make sure to disable
      // form submission until Checkout.js has loaded.
      console.error('Checkout is not available.');
      setErrorMessage('Payment system is not ready. Please wait a moment.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await checkout.confirm({
      // You can add additional confirmation options here if needed
      // confirmParams: {
      //   return_url: '...' // Optional: override the return_url set in the session
      // }
    });

    setIsLoading(false);

    // result.type can be 'success' or 'error'
    if (result.type === 'error') {
      // Show error to your customer (for example, payment details incomplete)
      console.error(result.error.message);
      setErrorMessage(result.error.message ?? 'An unexpected error occurred.');
    }
    // If result.type is 'success', the customer is automatically redirected
    // to the return_url you provided when creating the Checkout Session.
    // You don't need to handle the success case explicitly here unless
    // you want to show a custom message before redirection happens (which is uncommon).
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        // You can customize the PaymentElement with options
        // options={{ layout: 'tabs' }}
        onChange={() => {
          // Clear error message when user starts typing
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />
      <button type="submit" disabled={!checkout || isLoading} style={{ marginTop: '20px' }}>
        {isLoading ? 'Processing...' : 'Pay now'}
      </button>

      {/* Show any error messages */}       {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
}; 