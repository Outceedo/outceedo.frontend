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
import { Badge } from "@/components/ui/badge";
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
  faInfoCircle,
  faDollarSign,
  faBuilding,
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
                email: booking.player.email || "customer@example.com",
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="text-center pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon icon={faLock} className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Payment
          </h2>
          <p className="text-gray-600">
            Your payment is protected by industry-leading security
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Booking Summary</h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(booking.price)}
              </div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Service Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {booking.service.service.name}
                  </h4>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-green-600 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Expert</div>
                  <div className="font-semibold text-gray-900">
                    {booking.expert.username}
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-purple-600 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Session Date</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(booking.date)}
                  </div>
                </div>
              </div> */}

              {/* <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-orange-600 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Time Slot</div>
                  <div className="font-semibold text-gray-900">
                    {booking.startTime} - {booking.endTime}
                  </div>
                </div>
              </div> */}
            </div>

            {/* Player Information */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Booked by</div>
              <div className="font-medium text-gray-900">
                {booking.player.username}
              </div>
              <Badge variant="secondary" className="mt-2">
                Booking ID: #{booking.id.slice(-8)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
            <div className="flex items-center space-x-2">
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg"
                alt="Visa"
                className="h-6 opacity-80"
              />
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
                alt="Mastercard"
                className="h-6 opacity-80"
              />
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"
                alt="American Express"
                className="h-6 opacity-80"
              />
              <img
                src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg"
                alt="Discover"
                className="h-6 opacity-80"
              />
            </div>
          </div>

          <div className="relative">
            <div className="p-4 border-2 border-gray-200 rounded-xl bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-200">
              <CardElement
                options={{
                  hidePostalCode: false,
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1f2937",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontWeight: "500",
                      lineHeight: "24px",
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
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="text-green-600 text-lg"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">
                Your Payment is Secure
              </h4>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-xs flex-shrink-0"
                  />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-xs flex-shrink-0"
                  />
                  <span>PCI DSS Level 1 compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-xs flex-shrink-0"
                  />
                  <span>Card details never stored</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-xs flex-shrink-0"
                  />
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {!booking.paymentIntentClientSecret && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <h4 className="font-semibold text-red-900">
                  Payment Unavailable
                </h4>
                <p className="text-sm text-red-800 mt-1">
                  Payment intent could not be initialized. Please refresh the
                  page and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={processing}
            className="h-12 border-gray-300 hover:bg-gray-50 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !stripe || processing || !booking.paymentIntentClientSecret
            }
            className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
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
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faLock} />
                <span>Pay {formatCurrency(booking.price)}</span>
              </div>
            )}
          </Button>
        </div>

        {/* Footer Information */}
        <div className="text-center pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-3">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>
              Transaction ID: {booking.id} | Current Time:{" "}
              {new Date().toLocaleString()} UTC
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              By completing this payment, you agree to our{" "}
              <a
                href="/terms"
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
              >
                Privacy Policy
              </a>
            </p>
            <p className="flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faLock} className="text-green-600" />
              <span>
                Powered by Stripe • Your payment is secure and encrypted
              </span>
            </p>
          </div>
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
      <DialogContent className="sm:max-w-[680px] max-h-[95vh] overflow-y-auto p-0 bg-gray-50">
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </DialogTitle>
            <p className="text-gray-600">Secure checkout powered by Stripe</p>
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
