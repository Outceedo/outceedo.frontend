import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Check } from "lucide-react";
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
import { useAppDispatch } from "../store/hooks";
import {
  addExpertService,
  updateExpertService,
  deleteExpertService,
  getProfile,
} from "../store/profile-slice";
import Swal from "sweetalert2";
import axios from "axios";

interface Service {
  id?: string | number;
  serviceId?: string;
  name: string;
  description?: string;
  additionalDetails?: string;
  price: string | number;
  isActive?: boolean;
}

interface ExpertServicesProps {
  expertData?: any;
}

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// These are our predefined services that match with the backend
const PREDEFINED_SERVICES = [
  { id: "online-assessment", name: "Online Video Assessment" },
  { id: "in-person-assessment", name: "In-Person Assessment" },
  { id: "personal-training", name: "Personal Training" },
  { id: "group-coaching", name: "Group Coaching" },
  { id: "nutritional-advice", name: "Nutritional Advice" },
  { id: "fitness-planning", name: "Fitness Planning" },
];

const ExpertServices: React.FC<ExpertServicesProps> = ({ expertData = {} }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [tempServices, setTempServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [deletedServices, setDeletedServices] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<
    Record<string, Record<string, string>>
  >({});

  // Initialize services from expert data
  useEffect(() => {
    if (expertData && expertData.rawProfile && expertData.rawProfile.services) {
      const formattedServices = expertData.rawProfile.services.map(
        (service: any) => ({
          id: service._id || service.id,
          serviceId: service.serviceId || service._id || service.id,
          name: service.name || "Unnamed Service",
          description: service.description || "",
          additionalDetails: service.additionalDetails || "",
          price: service.price || 0,
          isActive: service.isActive || false,
        })
      );
      setServices(formattedServices);
    } else {
      // Fallback to localStorage if no API data
      const localServices = JSON.parse(
        localStorage.getItem("expertServices") ||
          JSON.stringify([
            {
              id: 1,
              serviceId: "online-assessment",
              name: "Online Video Assessment",
              description: "Video Assessment. Report.",
              price: 50,
              isActive: true,
            },
            {
              id: 2,
              serviceId: "in-person-assessment",
              name: "On-Field Assessment",
              description: "Live Assessment. Report",
              price: 30,
              isActive: false,
            },
            {
              id: 3,
              serviceId: "personal-training",
              name: "1-1 Training",
              description: "1 on 1 advise. doubts",
              price: 80,
              isActive: true,
            },
          ])
      );
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
          await dispatch(deleteExpertService(serviceId)).unwrap();
        }
      }

      // Process updated services
      const servicesToUpdate = tempServices.filter(
        (service) =>
          !newServices.some((newService) => newService.id === service.id) &&
          service.serviceId
      );

      for (const service of servicesToUpdate) {
        if (service.serviceId) {
          const priceValue = parsePrice(service.price);
          console.log("Updating service with serviceId:", service.serviceId);
          console.log("With price:", priceValue);

          // Ensure price is a valid number and serviceId is a string
          await dispatch(
            updateExpertService({
              serviceId: service.serviceId.toString(),
              price: Number(priceValue),
              additionalDetails:
                service.description || service.additionalDetails || "",
            })
          ).unwrap();
        }
      }

      // Process new services
      for (const service of newServices) {
        if (service.serviceId) {
          const priceValue = parsePrice(service.price);
          console.log("Adding service with serviceId:", service.serviceId);
          console.log("With price:", priceValue);

          // Ensure price is a valid number and serviceId is a string
          await dispatch(
            addExpertService({
              serviceId: service.serviceId.toString(),
              price: Number(priceValue),
              additionalDetails: service.description || "",
            })
          ).unwrap();
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

  // Get service name from ID
  const getServiceNameById = (id: string): string => {
    const service = PREDEFINED_SERVICES.find((s) => s.id === id);
    return service ? service.name : id;
  };

  // Update service
  const handleUpdateService = (
    index: number,
    field: keyof Service,
    value: string | number | boolean
  ) => {
    const updatedServices = [...tempServices];

    if (field === "serviceId" && typeof value === "string") {
      // When serviceId changes, also update the name
      updatedServices[index] = {
        ...updatedServices[index],
        serviceId: value,
        name: getServiceNameById(value),
      };
    } else {
      // Normal update for other fields
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      };
    }

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

  // Add new service with a default service ID
  const handleAddService = () => {
    // Use the first service from predefined list as default
    const defaultServiceId = PREDEFINED_SERVICES[0].id;
    const defaultServiceName = PREDEFINED_SERVICES[0].name;

    const newId = `new-${Date.now()}`;
    const newService = {
      id: newId,
      serviceId: defaultServiceId,
      name: defaultServiceName,
      description: "",
      price: 10,
      isActive: false,
    };

    setTempServices([...tempServices, newService]);
    setNewServices([...newServices, newService]);
  };

  // Remove service
  const handleRemoveService = (service: Service, index: number) => {
    // If it's a new service, just remove from tempServices and newServices
    if (newServices.some((s) => s.id === service.id)) {
      setNewServices(newServices.filter((s) => s.id !== service.id));
    }
    // If it's an existing service with serviceId, add to deletedServices
    else if (service.serviceId) {
      setDeletedServices([...deletedServices, service.serviceId.toString()]);
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
    if (!service.serviceId) return;

    const serviceId = service.serviceId.toString();
    setIsToggling({ ...isToggling, [serviceId]: true });

    try {
      const priceValue = parsePrice(service.price);
      console.log("Toggling service:", serviceId);
      console.log("With price:", priceValue);

      await dispatch(
        updateExpertService({
          serviceId: serviceId,
          price: Number(priceValue),
          additionalDetails:
            service.description || service.additionalDetails || "",
        })
      ).unwrap();

      // Update local state
      const updatedServices = services.map((s) =>
        s.serviceId === service.serviceId ? { ...s, isActive: !s.isActive } : s
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
    return `$${numericPrice}`;
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
              className="border-green-500 text-green-500 hover:bg-green-50"
              onClick={handleAddService}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Service
            </Button>
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing ? (
          // Edit mode
          tempServices.map((service, index) => (
            <Card
              key={service.id}
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
                    Service Type
                  </label>
                  <select
                    value={service.serviceId}
                    onChange={(e) =>
                      handleUpdateService(index, "serviceId", e.target.value)
                    }
                    className={`w-full p-2 border rounded-md ${
                      formErrors[index]?.serviceId
                        ? "border-red-500"
                        : "border-gray-300"
                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    disabled={isSubmitting}
                  >
                    {PREDEFINED_SERVICES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {formErrors[index]?.serviceId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[index].serviceId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Details
                  </label>
                  <Textarea
                    value={service.description || ""}
                    onChange={(e) =>
                      handleUpdateService(index, "description", e.target.value)
                    }
                    className="w-full min-h-[100px]"
                    disabled={isSubmitting}
                    placeholder="Add any additional details about this service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price ($)
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
        ) : // Display mode
        services.length > 0 ? (
          services.map((service) => (
            <Card
              key={service.id || service.serviceId}
              className="shadow-md dark:bg-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <span className="text-lg text-red-600 font-semibold">
                    {formatPrice(service.price)}/h
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {service.description ||
                    service.additionalDetails ||
                    "No description available"}
                </p>

                <div className="flex gap-10">
                  {/* Activate Button */}
                  <Button
                    onClick={() => handleToggleActive(service)}
                    disabled={isToggling[service.serviceId?.toString() || ""]}
                    className={`flex items-center gap-4 px-4 py-2 w-40 rounded font-semibold transition cursor-pointer
                          ${
                            service.isActive
                              ? "bg-red-400 text-white hover:bg-red-500"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }
                        `}
                  >
                    {isToggling[service.serviceId?.toString() || ""] ? (
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                    ) : (
                      service.isActive && <Check className="w-4 h-4" />
                    )}
                    Activate
                  </Button>

                  {/* Deactivate Button */}
                  <Button
                    onClick={() => handleToggleActive(service)}
                    disabled={isToggling[service.serviceId?.toString() || ""]}
                    className={`flex items-center gap-2 px-4 py-2 w-40 rounded font-semibold transition cursor-pointer
                          ${
                            !service.isActive
                              ? "bg-white text-black border-2 border-red-500 hover:bg-white"
                              : "bg-white border-2 border-red-500 text-black hover:bg-white"
                          }
                        `}
                  >
                    {isToggling[service.serviceId?.toString() || ""] ? (
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-red-500 rounded-full"></div>
                    ) : (
                      !service.isActive && <Check className="w-4 h-4" />
                    )}
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
            No services available. Click "Edit Services" to add new services.
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-2">
              Booking Confirmed: {selectedService.name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedService.description || selectedService.additionalDetails}
            </p>
            <p className="text-red-600 font-semibold mb-4">
              {formatPrice(selectedService.price)}/h
            </p>
            <Button className="w-full" onClick={() => setSelectedService(null)}>
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExpertServices;
