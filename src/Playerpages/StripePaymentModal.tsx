import React, { useState, useEffect } from "react";
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
  faExclamationTriangle,
  faLock,
  faShieldAlt,
  faCalendar,
  faUser,
  faClock,
  faCheckCircle,
  faInfoCircle,
  faBuilding,
  faSpinner,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/images/outceedologo.png";
import { FaStripe } from "react-icons/fa";

const PaymentForm = ({ booking, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  function printCurrentDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    return `${dateString} ${timeString}`;
  }

  useEffect(() => {
    // Validate payment intent on component mount
    const validation = validatePaymentIntent();
    if (!validation.isValid) {
      setValidationError(validation.error);
    } else {
      setValidationError(null);
    }
  }, [booking.paymentIntentClientSecret]);

  const validatePaymentIntent = () => {
    if (!booking?.paymentIntentClientSecret) {
      return {
        isValid: false,
        error:
          "Payment intent not initialized. Please refresh the page and try again.",
      };
    }

    if (typeof booking.paymentIntentClientSecret !== "string") {
      return {
        isValid: false,
        error:
          "Invalid payment intent format. Please refresh the page and try again.",
      };
    }

    if (!booking.paymentIntentClientSecret.includes("_secret_")) {
      return {
        isValid: false,
        error:
          "Invalid payment intent client secret format. Please refresh the page and try again.",
      };
    }

    // Extract and validate payment intent ID format
    const paymentIntentId =
      booking.paymentIntentClientSecret.split("_secret_")[0];
    if (!paymentIntentId.startsWith("pi_")) {
      return {
        isValid: false,
        error:
          "Invalid payment intent ID format. Please refresh the page and try again.",
      };
    }

    return { isValid: true, error: null };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear any previous validation errors
    setValidationError(null);

    // Validate payment intent before processing
    const validation = validatePaymentIntent();
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setProcessing(true);

    if (!stripe || !elements) {
      setValidationError(
        "Payment system not loaded. Please refresh the page and try again."
      );
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setValidationError(
        "Card element not found. Please refresh the page and try again."
      );
      setProcessing(false);
      return;
    }

    try {
      // Extract payment intent ID for logging
      const paymentIntentId =
        booking.paymentIntentClientSecret.split("_secret_")[0];

      console.log("Processing payment:", {
        bookingId: booking.id,
        paymentIntentId,
        user: booking.player?.username,
        timestamp: new Date().toISOString(),
        retryCount,
      });

      // First, retrieve the payment intent to check its current status
      const { paymentIntent: retrievedPaymentIntent, error: retrieveError } =
        await stripe.retrievePaymentIntent(booking.paymentIntentClientSecret);

      if (retrieveError) {
        console.error("Error retrieving payment intent:", {
          error: retrieveError,
          code: retrieveError.code,
          type: retrieveError.type,
          paymentIntentId,
          bookingId: booking.id,
        });

        // Handle specific error types
        if (retrieveError.code === "resource_missing") {
          throw new Error(
            "Payment session has expired or is invalid. Please refresh the page and try again."
          );
        } else if (retrieveError.code === "invalid_request_error") {
          throw new Error(
            "Invalid payment request. Please refresh the page and try again."
          );
        } else {
          throw new Error(
            retrieveError.message ||
              "Failed to retrieve payment information. Please try again."
          );
        }
      }

      console.log("Payment intent retrieved:", {
        id: retrievedPaymentIntent.id,
        status: retrievedPaymentIntent.status,
        amount: retrievedPaymentIntent.amount,
        currency: retrievedPaymentIntent.currency,
      });

      // Check if payment already succeeded
      if (retrievedPaymentIntent.status === "succeeded") {
        console.log("Payment already completed:", {
          bookingId: booking.id,
          paymentIntentId: retrievedPaymentIntent.id,
          amount: retrievedPaymentIntent.amount,
          currency: retrievedPaymentIntent.currency,
          completedAt: new Date().toISOString(),
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

      // Handle different payment intent statuses
      if (
        retrievedPaymentIntent.status === "requires_payment_method" ||
        retrievedPaymentIntent.status === "requires_confirmation"
      ) {
        console.log("Confirming card payment...");

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          booking.paymentIntentClientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: booking.player?.username || "Customer",
                email: booking.player?.email || "customer@example.com",
              },
            },
          }
        );

        if (error) {
          console.error("Payment confirmation error:", {
            error,
            type: error.type,
            code: error.code,
            paymentIntentId,
          });

          if (
            error.type === "card_error" ||
            error.type === "validation_error"
          ) {
            throw new Error(error.message);
          } else if (error.code === "payment_intent_authentication_failure") {
            throw new Error(
              "Payment authentication failed. Please try a different card or payment method."
            );
          } else {
            throw new Error(
              "Payment failed. Please check your card details and try again."
            );
          }
        }

        if (paymentIntent.status === "succeeded") {
          console.log("Payment confirmed successfully:", {
            bookingId: booking.id,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            confirmedAt: new Date().toISOString(),
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
          console.log("Payment requires additional action...");

          const { error: actionError } = await stripe.handleCardAction(
            booking.paymentIntentClientSecret
          );

          if (actionError) {
            console.error("Card action error:", actionError);
            throw new Error(
              actionError.message ||
                "Payment authentication failed. Please try again."
            );
          } else {
            // Recursively handle the payment after action
            setRetryCount((prev) => prev + 1);
            await handleSubmit(event);
          }
        } else {
          throw new Error(
            `Payment ${paymentIntent.status}. Please try again or contact support.`
          );
        }
      } else if (retrievedPaymentIntent.status === "processing") {
        throw new Error(
          "Payment is being processed. Please wait a moment and check your booking status."
        );
      } else if (retrievedPaymentIntent.status === "canceled") {
        throw new Error(
          "Payment was canceled. Please refresh the page and try again."
        );
      } else {
        throw new Error(
          `Payment is in ${retrievedPaymentIntent.status} status. Please refresh the page or contact support.`
        );
      }
    } catch (error) {
      console.error("Payment processing error:", {
        error: error.message,
        bookingId: booking.id,
        paymentIntentId:
          booking.paymentIntentClientSecret?.split("_secret_")[0],
        timestamp: new Date().toISOString(),
        retryCount,
      });

      setValidationError(error.message || "Payment failed. Please try again.");
      onError(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setValidationError(null);
    setRetryCount(0);

    // Re-validate payment intent
    const validation = validatePaymentIntent();
    if (!validation.isValid) {
      setValidationError(validation.error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "£0.00";

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";

    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const isFormValid = () => {
    const validation = validatePaymentIntent();
    return validation.isValid && stripe && elements && !processing;
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="text-center border-b border-gray-100">
          <img className="text-2xl text-white" src={logo} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Payment
          </h2>
          <p className="text-gray-600">
            Your payment is protected by industry-leading security
          </p>

          <p className="text-blue-800">
            <FaStripe
              className="text-7xl mx-auto cursor-pointer"
              onClick={() => {
                window.open("https://stripe.com", "_blank");
              }}
            />
          </p>
        </div>

        {/* Error State */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Payment Error</h4>
                <p className="text-sm text-red-800 mt-1">{validationError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

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
            {booking.service?.service?.name && (
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
            )}

            {/* Session Details */}
            <div className="grid grid-cols-1 gap-4">
              {booking.expert?.username && (
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
              )}

              {booking.date && (
                <div className="flex items-center space-x-3">
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
                </div>
              )}

              {booking.startTime && booking.endTime && (
                <div className="flex items-center space-x-3">
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
                </div>
              )}
            </div>

            {/* Player Information */}
            {booking.player?.username && (
              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-1">Booked by</div>
                <div className="font-medium text-gray-900">
                  {booking.player.username}
                </div>
                {booking.id && (
                  <Badge variant="secondary" className="mt-2">
                    Booking ID: #{booking.id.toString().slice(-8)}
                  </Badge>
                )}
              </div>
            )}
            <div className="text-sm text-gray-600 mb-1">Time and Date</div>
            <p>
              <Badge variant="secondary" className="mt-2">
                {printCurrentDateTime()}{" "}
              </Badge>
            </p>
          </div>
        </div>

        {/* Payment Method Section */}
        {!validationError && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Payment Method
              </h3>
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
        )}

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
            disabled={!isFormValid()}
            className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
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
              Transaction ID: {booking.id} | Current Time: 2025-08-05 15:15:00
              UTC
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              By completing this payment, you agree to our{" "}
              <a
                href="/terms"
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
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
    console.log("Payment successful:", {
      bookingId: booking.id,
      paymentResult,
      timestamp: new Date().toISOString(),
    });
    onSuccess(booking.id, paymentResult);
    onClose();
  };

  const handleError = (error) => {
    console.error("Payment error in modal:", {
      error,
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
    });
    onError(error);
  };

  const handleClose = () => {
    console.log("Payment modal closed:", {
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  if (!booking) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[95vh] overflow-y-auto p-0 bg-gray-50">
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2"></DialogTitle>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <PaymentForm
              booking={booking}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleClose}
            />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;
