import React, { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faExclamationTriangle,
  faLock,
  faShieldAlt,
  faCalendar,
  faUser,
  faClock,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const PaymentForm = ({ booking, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      if (!booking.paymentIntentClientSecret) {
        throw new Error("Payment intent not found. Please try again.");
      }

      const { paymentIntent: retrievedPaymentIntent, error: retrieveError } =
        await stripe.retrievePaymentIntent(booking.paymentIntentClientSecret);

      if (retrieveError) {
        console.error("Error retrieving payment intent:", retrieveError);
        throw new Error(retrieveError.message);
      }

      if (retrievedPaymentIntent.status === "succeeded") {
        console.log("Payment already succeeded:", {
          bookingId: booking.id,
          paymentIntentId: retrievedPaymentIntent.id,
          amount: retrievedPaymentIntent.amount,
          currency: retrievedPaymentIntent.currency,
          user: booking.player.username,
          expertId: booking.expertId,
          serviceId: booking.serviceId,
          sessionDate: booking.date,
          sessionTime: `${booking.startTime}-${booking.endTime}`,
          paymentStatus: retrievedPaymentIntent.status,
        });

        const paymentResult = {
          paymentIntent: {
            id: retrievedPaymentIntent.id,
            status: retrievedPaymentIntent.status,
            amount: retrievedPaymentIntent.amount,
            currency: retrievedPaymentIntent.currency,
            created: retrievedPaymentIntent.created,
            payment_method: retrievedPaymentIntent.payment_method,
          },
        };

        onSuccess(paymentResult);
        return;
      }

      if (
        retrievedPaymentIntent.status === "requires_payment_method" ||
        retrievedPaymentIntent.status === "requires_confirmation"
      ) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          booking.paymentIntentClientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: booking.player.username || "Customer",
                email: "customer@example.com",
              },
            },
          }
        );

        if (error) {
          console.error("Payment confirmation error:", error);
          if (
            error.type === "card_error" ||
            error.type === "validation_error"
          ) {
            onError(error.message);
          } else {
            onError("An unexpected error occurred. Please try again.");
          }
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === "succeeded") {
          console.log("Payment processed:", {
            bookingId: booking.id,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            
            expertId: booking.expertId,
            serviceId: booking.serviceId,
            sessionDate: booking.date,
            sessionTime: `${booking.startTime}-${booking.endTime}`,
            paymentStatus: paymentIntent.status,
          });

          const paymentResult = {
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              created: paymentIntent.created,
              payment_method: paymentIntent.payment_method,
            },
          };

          onSuccess(paymentResult);
        } else if (paymentIntent.status === "requires_action") {
          const { error: actionError } = await stripe.handleCardAction(
            booking.paymentIntentClientSecret
          );

          if (actionError) {
            onError(actionError.message);
          } else {
            await handleSubmit(event);
          }
        } else {
          onError(`Payment ${paymentIntent.status}. Please try again.`);
        }
      } else {
        onError(
          `Payment intent is in ${retrievedPaymentIntent.status} status. Please contact support.`
        );
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      onError(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center pb-4 border-b border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-2xl text-blue-600"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Secure Payment
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete your booking payment
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-lg">
              Booking Summary
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              ${booking.price}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <FontAwesomeIcon
                icon={faUser}
                className="w-4 h-4 text-gray-500 mr-3"
              />
              <span className="text-gray-600">Expert:</span>
              <span className="ml-2 font-medium text-gray-800">
                {booking.expert.username}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <FontAwesomeIcon
                icon={faCalendar}
                className="w-4 h-4 text-gray-500 mr-3"
              />
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium text-gray-800">
                {new Date(booking.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <FontAwesomeIcon
                icon={faClock}
                className="w-4 h-4 text-gray-500 mr-3"
              />
              <span className="text-gray-600">Time:</span>
              <span className="ml-2 font-medium text-gray-800">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>

            <div className="pt-2 border-t border-blue-200">
              <div className="font-medium text-gray-800">
                {booking.service.service.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Session with {booking.player.username}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Payment Information
            </label>
            <div className="flex items-center space-x-2">
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg"
                alt="Visa"
                className="h-6"
              />
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"
                alt="Amex"
                className="h-6"
              />
            </div>
          </div>

          <div className="relative">
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1f2937",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: "500",
                      "::placeholder": {
                        color: "#9ca3af",
                        fontWeight: "400",
                      },
                    },
                    invalid: {
                      color: "#ef4444",
                      iconColor: "#ef4444",
                    },
                    complete: {
                      color: "#059669",
                      iconColor: "#059669",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-700 font-medium mb-1">
              💳 Test Mode - Use test card details:
            </div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>Card: 4242 4242 4242 4242</div>
              <div>Expiry: Any future date (e.g., 12/30)</div>
              <div>CVC: Any 3 digits (e.g., 123)</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="text-green-600 mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-green-600 text-sm"
                />
                <span className="text-sm font-medium text-green-800">
                  256-bit SSL encryption
                </span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                  <span>PCI DSS compliant payment processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                  <span>Your card details are never stored on our servers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!booking.paymentIntentClientSecret && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span className="font-medium">Payment Unavailable</span>
            </div>
            <p className="mt-1">
              Payment intent not available. Please refresh and try again.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={processing}
            className="h-12 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !stripe || processing || !booking.paymentIntentClientSecret
            }
            className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
          >
            {processing ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faLock} />
                <span>Pay ${booking.price}</span>
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>
            By completing this payment, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="mt-1">
            Current Time: 2025-06-16 17:18:41 UTC | User: 22951a3363
          </p>
        </div>
      </form>
    </div>
  );
};

const StripePaymentModal = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
  onError,
  stripePromise,
}) => {
  const handleSuccess = (paymentResult) => {
    onSuccess(booking.id, paymentResult);
    onClose();
  };

  const handleError = (error) => {
    console.error("Payment error:", error);
    onError(error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Complete Payment
            </DialogTitle>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <PaymentForm
              booking={booking}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;
