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

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
}



const ExpertServices: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isActive, setIsActive] = useState(false);
  // Services state
  const [services, setServices] = useState<Service[]>(
    JSON.parse(
      localStorage.getItem("expertServices") ||
        JSON.stringify([
          {
            id: 1,
            name: "Online Video Assessment",
            description: "Video Assessment. Report.",
            price: "$50/h",
          },
          {
            id: 2,
            name: "On-Field Assessment",
            description: "Live Assessment. Report",
            price: "$30/h",
          },
          {
            id: 3,
            name: "1-1 Training",
            description: "1 on 1 advise. doubts",
            price: "$80/h",
          },
         


        ])
    )
  );
  const [tempServices, setTempServices] = useState<Service[]>([...services]);

  // Edit services
  const startEditing = () => {
    setTempServices([...services]);
    setIsEditing(true);
  };

  // Save services
  const handleSave = () => {
    setServices([...tempServices]);
    localStorage.setItem("expertServices", JSON.stringify(tempServices));
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setTempServices([...services]);
    setIsEditing(false);
  };

  // Update service
  const handleUpdateService = (
    index: number,
    field: keyof Service,
    value: string
  ) => {
    const updatedServices = [...tempServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === "id" ? parseInt(value) : value,
    };
    setTempServices(updatedServices);
  };

  // Add new service
  const handleAddService = () => {
    const newId = Math.max(0, ...tempServices.map((s) => s.id)) + 1;
    setTempServices([
      ...tempServices,
      {
        id: newId,
        name: "New Service",
        description: "Description",
        price: "$0/h",
      },
    ]);
  };

  // Remove service
  const handleRemoveService = (serviceId: number) => {
    setTempServices(tempServices.filter((service) => service.id !== serviceId));
  };

  // Book service
  const handleBookService = (service: Service) => {
    setSelectedService(service);
  };

 

  return (
    <div className="p-4 w-full space-y-6 ">
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
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Service
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
            </Button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing
          ? // Edit mode
            tempServices.map((service, index) => (
              <Card
                key={service.id}
                className="p-4 shadow-sm dark:bg-gray-700 relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveService(service.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Name
                    </label>
                    <Input
                      value={service.name}
                      onChange={(e) =>
                        handleUpdateService(index, "name", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={service.description}
                      onChange={(e) =>
                        handleUpdateService(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <Input
                      value={service.price}
                      onChange={(e) =>
                        handleUpdateService(index, "price", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            ))
          : // Display mode
            services.map((service) => (
              <Card
                key={service.id}
                className="shadow-md dark:bg-gray-700 overflow-hidden"
              >
                <div className="px-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    <span className="text-lg text-red-600 font-semibold">
                      {service.price}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {service.description}
                  </p>
                 
                
                  <div className="flex gap-10">
      {/* Activate Button */}
      <Button
        onClick={() => setIsActive(true)}
        className={`flex items-center gap-4 px-4 py-2 w-40 rounded font-semibold transition cursor-pointer
          ${isActive ? "bg-red-400 text-white  hover:bg-red-500" : "bg-red-600 hover:bg-red-700 text-white"}
        `}
      >
        {isActive && <Check className="w-4 h-4" />}
        Activate
      </Button>

      {/* Deactivate Button */}
      <Button
        onClick={() => setIsActive(false)}
        className={`flex items-center gap-2 px-4 py-2 w-40 rounded font-semibold transition cursor-pointer
          ${!isActive ? "bg-white text-black border-2 border-red-500 hover:bg-white" : "bg-white  border-2 border-red-500 text-black  hover:bg-white"}
        `}
      >
        {!isActive && <Check className="w-4 h-4" />}
        Deactivate
      </Button>
    </div>



                </div>
              </Card>
            ))}
      </div>

      {/* Booking Confirmation Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-2">
              Booking Confirmed: {selectedService.name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedService.description}
            </p>
            <p className="text-red-600 font-semibold mb-4">
              {selectedService.price}
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
