import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Check, PlusCircle } from "lucide-react";
import {
  faPen,
  faSave,
  faTimes,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addExpertService,
  updateExpertService,
  deleteExpertService,
  getProfile,
  getPlatformServices,
} from "../store/profile-slice";
import Swal from "sweetalert2";
import axios from "axios";

interface Service {
  id?: string | number;
  serviceId?: string;
  name: string;
  description?: string;
  additionalDetails?: string | object;
  price: string | number;
  isActive?: boolean;
}

interface PlatformService {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpertServicesProps {
  expertData?: any;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Constants for service ID logic
const PLATFORM_SERVICE_IDS = ["1", "2", "3", "4"]; // Platform service IDs - ENSURES ALL 4 ARE COVERED
const CUSTOM_SERVICE_PREFIX = "custom-";
const CUSTOM_SERVICE_START_ID = 5; // Custom services start from ID 5 (after the 4 platform services)

// Service name mapping
const SERVICE_NAME_MAP: Record<string, string> = {
  "1": "RECORDED VIDEO ASSESSMENT",
  "2": "ONLINE TRAINING",
  "3": "ON GROUND ASSESSMENT",
  "4": "ONLINE ASSESSMENT",
};

// Helper function to get service name from ID
const getServiceNameById = (serviceId: string | number | undefined): string => {
  if (!serviceId) return "Unknown Service";

  const id = String(serviceId);
  return SERVICE_NAME_MAP[id] || "Custom Service";
};

// Helper function to format additionalDetails for display
const formatAdditionalDetails = (
  details: string | object | undefined
): string => {
  if (!details) return "No description available";

  if (typeof details === "string") return details;

  if (typeof details === "object") {
    try {
      // Try to get description property or stringify the object
      if ((details as any).description) {
        return (details as any).description;
      }

      // Convert object to readable format
      const detailsArray = Object.entries(details)
        .map(([key, value]) => {
          if (key === "duration") return null; // Skip duration in display
          return `${key}: ${value}`;
        })
        .filter(Boolean); // Remove nulls

      return detailsArray.join(", ");
    } catch (error) {
      return "Additional details available";
    }
  }

  return "No description available";
};

const ExpertServices: React.FC<ExpertServicesProps> = ({ expertData = {} }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const [isAddingCustomService, setIsAddingCustomService] = useState(false);
  const [isAddingPlatformService, setIsAddingPlatformService] = useState(false);
  const [selectedPlatformService, setSelectedPlatformService] =
    useState<PlatformService | null>(null);
  const [platformServicePrice, setPlatformServicePrice] = useState<number>(10);
  const [customServiceCounter, setCustomServiceCounter] = useState(
    CUSTOM_SERVICE_START_ID
  ); // Counter for custom service IDs
  const [customService, setCustomService] = useState<Service>({
    name: "",
    description: "",
    price: 0,
  });

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [tempServices, setTempServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [deletedServices, setDeletedServices] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<
    Record<string, Record<string, string>>
  >({});

  // Modal management
  const modalRef = useRef<HTMLDivElement>(null);

  // Get platform services from Redux state
  const { platformServices, status } = useAppSelector((state) => state.profile);

  // Handle modal overlay
  useEffect(() => {
    // Disable body scroll when any modal is open
    if (isAddingPlatformService || isAddingCustomService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAddingPlatformService, isAddingCustomService]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (isAddingPlatformService) {
          setIsAddingPlatformService(false);
          setSelectedPlatformService(null);
        }
        if (isAddingCustomService) {
          setIsAddingCustomService(false);
        }
      }
    };

    if (isAddingPlatformService || isAddingCustomService) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingPlatformService, isAddingCustomService]);

  // Call getPlatformServices when component initializes
  useEffect(() => {
    const fetchPlatformServices = async () => {
      try {
        const resultAction = await dispatch(getPlatformServices());
        if (getPlatformServices.fulfilled.match(resultAction)) {
          console.log("Platform services response:", resultAction.payload);
        } else if (getPlatformServices.rejected.match(resultAction)) {
          console.error(
            "Failed to fetch platform services:",
            resultAction.error
          );
        }
      } catch (error) {
        console.error("Error fetching platform services:", error);
      }
    };

    fetchPlatformServices();
  }, [dispatch]);

  // Initialize services from expert data and update customServiceCounter
  useEffect(() => {
    let maxId = CUSTOM_SERVICE_START_ID - 1;

    if (expertData && expertData.rawProfile && expertData.rawProfile.services) {
      const formattedServices = expertData.rawProfile.services.map(
        (service: any) => {
          // Get ID from service
          const serviceId = service.serviceId || service._id || service.id;

          // Get service name from mapping or set it as custom
          const serviceName = getServiceNameById(serviceId);

          // Check if this is a custom service ID (non-platform) and update maxId if needed
          if (
            !PLATFORM_SERVICE_IDS.includes(serviceId.toString()) &&
            !serviceId.toString().startsWith(CUSTOM_SERVICE_PREFIX)
          ) {
            const numId = parseInt(serviceId.toString());
            if (!isNaN(numId) && numId >= maxId) {
              maxId = numId;
            }
          }

          // Handle additionalDetails properly
          let description = "";
          if (service.description) {
            description = service.description;
          } else if (service.additionalDetails) {
            if (typeof service.additionalDetails === "string") {
              description = service.additionalDetails;
            } else if (
              typeof service.additionalDetails === "object" &&
              service.additionalDetails.description
            ) {
              description = service.additionalDetails.description;
            }
          }

          return {
            id: service._id || service.id,
            serviceId: serviceId,
            name: serviceName,
            description: description,
            additionalDetails: service.additionalDetails || "",
            price: service.price || 0,
            isActive: service.isActive || false,
          };
        }
      );

      setServices(formattedServices);
      // Update custom service counter to be one more than the max ID found
      setCustomServiceCounter(maxId + 1);

      console.log("Initialized services:", formattedServices);
      console.log("Custom service counter set to:", maxId + 1);
    } else {
      // Fallback to localStorage if no API data
      const localServices = JSON.parse(localStorage.getItem("expertServices"));
      setServices(localServices);
    }
  }, [expertData]);

  // Edit services
  const startEditing = () => {
    setTempServices([...services]);
    setNewServices([]);
    setDeletedServices([]);
    setFormErrors({});
    setIsEditing(true);
  };

  // Helper function to parse price values correctly
  const parsePrice = (price: string | number): number => {
    if (typeof price === "number") return price;

    // Remove any non-numeric characters except decimal point
    const numericString = price.replace(/[^0-9.]/g, "");
    const parsedValue = parseFloat(numericString);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };

  // Generate a unique ID for custom services
  const generateCustomServiceId = (): string => {
    // Use the counter as ID and increment it
    const newId = customServiceCounter.toString();
    setCustomServiceCounter(customServiceCounter + 1);
    return newId;
  };

  // Handle service field updates
  const handleUpdateService = (
    index: number,
    field: keyof Service,
    value: string | number | boolean
  ) => {
    const updatedServices = [...tempServices];

    // Don't allow name updates for platform services
    if (
      field === "name" &&
      isPlatformService(updatedServices[index].serviceId)
    ) {
      return; // Skip updating name for platform services
    }

    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };

    // Clear the error for this field if it exists
    if (formErrors[index]?.[field]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[index][field];

      if (Object.keys(updatedErrors[index]).length === 0) {
        delete updatedErrors[index];
      }

      setFormErrors(updatedErrors);
    }

    setTempServices(updatedServices);
  };

  // Handle ESC key press to close modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isAddingPlatformService) {
        setIsAddingPlatformService(false);
        setSelectedPlatformService(null);
      }
      if (isAddingCustomService) {
        setIsAddingCustomService(false);
      }
    }
  };

  // Save services
  const handleSave = async () => {
    // Validate all services first
    let isValid = true;
    const newErrors: Record<string, Record<string, string>> = {};

    tempServices.forEach((service, index) => {
      const serviceErrors: Record<string, string> = {};

      if (!service.serviceId) {
        serviceErrors.serviceId = "Service ID is required";
        isValid = false;
      }

      if (parsePrice(service.price) <= 0) {
        serviceErrors.price = "Price must be greater than zero";
        isValid = false;
      }

      if (Object.keys(serviceErrors).length > 0) {
        newErrors[index] = serviceErrors;
      }
    });

    if (!isValid) {
      setFormErrors(newErrors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the errors in the form before saving",
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Process deleted services first
      for (const serviceId of deletedServices) {
        if (serviceId && typeof serviceId === "string") {
          // Using the service ID directly for deletion
          await dispatch(deleteExpertService(serviceId)).unwrap();
          console.log(`Deleted service with ID: ${serviceId}`);
        }
      }

      // Process updated services
      const servicesToUpdate = tempServices.filter(
        (service) =>
          !newServices.some((newService) => newService.id === service.id) &&
          service.id && // Use the id for update, not serviceId
          service.serviceId
      );

      for (const service of servicesToUpdate) {
        if (service.id) {
          // Use id for update API endpoint
          const priceValue = parsePrice(service.price);
          console.log("Updating service with id:", service.id);
          console.log("With price:", priceValue);

          // Create additionalDetails object from description
          const additionalDetails = {
            description: service.description || "",
            duration: "60 minutes", // Default duration
          };

          // Using the service ID directly for updates
          await dispatch(
            updateExpertService({
              serviceId: service.id.toString(), // Use id not serviceId
              price: Number(priceValue),
              additionalDetails,
            })
          ).unwrap();

          console.log(`Service ${service.id} updated with price ${priceValue}`);
        }
      }

      // Process new services
      for (const service of newServices) {
        if (service.serviceId) {
          const priceValue = parsePrice(service.price);
          console.log("Adding service with serviceId:", service.serviceId);
          console.log("With price:", priceValue);

          // Create additionalDetails object
          const additionalDetails = {
            description: service.description || "",
            duration: "60 minutes", // Default duration
          };

          // Use the platform service ID for adding new services
          await dispatch(
            addExpertService({
              serviceId: service.serviceId.toString(),
              price: Number(priceValue),
              additionalDetails,
            })
          ).unwrap();

          console.log(
            `Service ${service.serviceId} added with price ${priceValue}`
          );
        }
      }

      // Update local state
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Services updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh profile data
      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
      }

      // Reset edit mode
      setIsEditing(false);
      setNewServices([]);
      setDeletedServices([]);
    } catch (error: any) {
      console.error("Service update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.error ||
          error.message ||
          "Failed to update services",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setTempServices([...services]);
    setNewServices([]);
    setDeletedServices([]);
    setFormErrors({});
    setIsEditing(false);
  };

  // Open platform service adding modal
  const openAddPlatformServiceModal = (ps: PlatformService) => {
    setSelectedPlatformService(ps);
    setPlatformServicePrice(10); // Default price
    setIsAddingPlatformService(true);
  };

  // Add platform service with custom price
  const handleAddPlatformServiceSubmit = () => {
    if (!selectedPlatformService) return;

    if (parsePrice(platformServicePrice) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Price must be greater than zero",
      });
      return;
    }

    // Check if service is already added
    const isServiceAlreadyAdded = tempServices.some(
      (service) => service.serviceId === selectedPlatformService.id
    );

    if (isServiceAlreadyAdded) {
      Swal.fire({
        icon: "warning",
        title: "Service Already Added",
        text: `${selectedPlatformService.name} is already in your services.`,
      });
      setIsAddingPlatformService(false);
      return;
    }

    // Create a new service from platform service with custom price
    const newId = `new-${Date.now()}`;
    const newService = {
      id: newId,
      serviceId: selectedPlatformService.id,
      name: selectedPlatformService.name,
      description: selectedPlatformService.description || "",
      price: platformServicePrice,
      isActive: false,
    };

    setTempServices([...tempServices, newService]);
    setNewServices([...newServices, newService]);

    setIsAddingPlatformService(false);
    setSelectedPlatformService(null);

    Swal.fire({
      icon: "success",
      title: "Service Added",
      text: `${selectedPlatformService.name} has been added to your services.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Handle adding a custom service
  const handleAddCustomServiceSubmit = () => {
    if (!customService.name) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Service name is required",
      });
      return;
    }

    if (parsePrice(customService.price) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Price must be greater than zero",
      });
      return;
    }

    // Generate a custom service ID with counter
    const serviceId = generateCustomServiceId();

    // Create a new service
    const newId = `new-${Date.now()}`;
    const newService = {
      id: newId,
      serviceId: serviceId,
      name: customService.name,
      description: customService.description || "",
      price: customService.price,
      isActive: false,
    };

    setTempServices([...tempServices, newService]);
    setNewServices([...newServices, newService]);

    // Reset custom service form
    setCustomService({
      name: "",
      description: "",
      price: 0,
    });

    setIsAddingCustomService(false);

    Swal.fire({
      icon: "success",
      title: "Custom Service Added",
      text: `${customService.name} has been added to your services.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Remove service
  const handleRemoveService = (service: Service, index: number) => {
    // If it's a new service, just remove from tempServices and newServices
    if (newServices.some((s) => s.id === service.id)) {
      setNewServices(newServices.filter((s) => s.id !== service.id));
    }
    // If it's an existing service with ID, add to deletedServices
    else if (service.id) {
      setDeletedServices([...deletedServices, service.id.toString()]);
    }

    // Remove from tempServices in any case
    setTempServices(tempServices.filter((_, i) => i !== index));

    // Remove any errors for this service
    if (formErrors[index]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[index];
      setFormErrors(updatedErrors);
    }
  };

  // Toggle service active state
  const handleToggleActive = async (service: Service) => {
    if (!service.id) return;

    const serviceId = service.id.toString();
    setIsToggling({ ...isToggling, [serviceId]: true });

    try {
      const priceValue = parsePrice(service.price);
      console.log("Toggling service:", serviceId);
      console.log("With price:", priceValue);

      // Create additionalDetails object with isActive toggle
      const additionalDetails = {
        description:
          typeof service.description === "string" ? service.description : "",
        isActive: !service.isActive,
        duration: "60 minutes", // Add duration to ensure it's preserved
      };

      // Use the service ID directly for toggles
      await dispatch(
        updateExpertService({
          serviceId: serviceId,
          price: Number(priceValue),
          additionalDetails,
        })
      ).unwrap();

      // Update local state
      const updatedServices = services.map((s) =>
        s.id === service.id ? { ...s, isActive: !s.isActive } : s
      );
      setServices(updatedServices);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Service ${
          !service.isActive ? "activated" : "deactivated"
        } successfully`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh profile data
      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
      }
    } catch (error: any) {
      console.error("Service toggle error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.error ||
          error.message ||
          "Failed to update service status",
      });
    } finally {
      setIsToggling({ ...isToggling, [serviceId]: false });
    }
  };

  // Format price display
  const formatPrice = (price: string | number): string => {
    const numericPrice = parsePrice(price);
    return `£${numericPrice}`;
  };

  // Check if a service is a platform service (IDs 1-4)
  const isPlatformService = (serviceId: string | undefined): boolean => {
    return !!serviceId && PLATFORM_SERVICE_IDS.includes(serviceId);
  };

  // Check if a service is a custom service
  const isCustomService = (serviceId: string | undefined): boolean => {
    return !!serviceId && !PLATFORM_SERVICE_IDS.includes(serviceId);
  };

  return (
    <div className="p-4 w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Services Offered
        </h2>

        {!isEditing ? (
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700"
            onClick={startEditing}
          >
            <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit Services
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Platform Services Section (when editing) */}
      {isEditing && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Available Platform Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformServices && platformServices.length > 0 ? (
              platformServices.map((ps) => (
                <Card
                  key={ps.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 relative"
                >
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {ps.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ps.description || "No description available"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-red-600 hover:bg-red-700 text-white w-full"
                    onClick={() => openAddPlatformServiceModal(ps)}
                    disabled={tempServices.some((s) => s.serviceId === ps.id)}
                  >
                    {tempServices.some((s) => s.serviceId === ps.id) ? (
                      "Already Added"
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Service
                      </>
                    )}
                  </Button>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
                {status === "loading" ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                ) : (
                  "No platform services available."
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform Service Price Modal */}
      {isAddingPlatformService && selectedPlatformService && (
        <>
          {/* Modal Backdrop - fixed, covers entire screen with blur */}
          <div
            className="fixed inset-0 backdrop-blur-xs z-40"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            role="dialog"
            aria-modal="true"
            onKeyDown={handleKeyDown}
          >
            <div
              ref={modalRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
              tabIndex={-1}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Add {selectedPlatformService.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Description
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      {selectedPlatformService.description ||
                        "No description available"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Set Your Price (£) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={platformServicePrice}
                      onChange={(e) =>
                        setPlatformServicePrice(e.target.valueAsNumber || 0)
                      }
                      placeholder="Enter your price for this service"
                      className="focus:ring-2 focus:ring-red-500"
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Set the price you want to charge for this service
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingPlatformService(false);
                        setSelectedPlatformService(null);
                      }}
                      className="focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                      onClick={handleAddPlatformServiceSubmit}
                    >
                      Add Service
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Current Services Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          {isEditing ? "Your Services (Editing)" : "Your Services"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isEditing ? (
            // Edit mode
            tempServices.length > 0 ? (
              tempServices.map((service, index) => (
                <Card
                  key={service.id || `temp-${index}`}
                  className="p-4 shadow-sm dark:bg-gray-700 relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveService(service, index)}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service Name{" "}
                        {isPlatformService(service.serviceId) && (
                          <span className="text-gray-500 text-xs">
                            (Not Editable)
                          </span>
                        )}
                      </label>
                      {isPlatformService(service.serviceId) ? (
                        // For platform services, show name as disabled input
                        <Input
                          type="text"
                          value={service.name}
                          className="w-full bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                          disabled={true}
                        />
                      ) : (
                        // For custom services, allow name editing
                        <Input
                          type="text"
                          value={service.name}
                          onChange={(e) =>
                            handleUpdateService(index, "name", e.target.value)
                          }
                          className="w-full"
                          disabled={isSubmitting}
                          placeholder="Service name"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Additional Details
                      </label>
                      <Textarea
                        value={
                          typeof service.description === "string"
                            ? service.description
                            : typeof service.description === "object"
                            ? JSON.stringify(service.description)
                            : ""
                        }
                        onChange={(e) =>
                          handleUpdateService(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full min-h-[100px]"
                        disabled={isSubmitting}
                        placeholder="Add any additional details about this service"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (£)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={parsePrice(service.price)}
                        onChange={(e) => {
                          const numValue = e.target.valueAsNumber || 0;
                          handleUpdateService(index, "price", numValue);
                        }}
                        className={`w-full ${
                          formErrors[index]?.price ? "border-red-500" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors[index]?.price && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors[index].price}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
                No services added yet. Add platform services or create custom
                services.
              </div>
            )
          ) : // Display mode
          services.length > 0 ? (
            services.map((service) => (
              <Card
                key={service.id || service.serviceId}
                className="shadow-md dark:bg-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {service.name}
                      </h3>
                    </div>
                    <span className="text-lg text-red-600 font-semibold">
                      {formatPrice(service.price)}/h
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {formatAdditionalDetails(
                      service.description || service.additionalDetails
                    )}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
              No services available. Click "Edit Services" to add new services.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertServices;
