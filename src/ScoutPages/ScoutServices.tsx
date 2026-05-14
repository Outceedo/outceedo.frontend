import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ScoutService {
  id: string;
  scoutId: string;
  title: string;
  description: string | null;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

type DraftService = {
  id: string; // local id for UI keying; new ones are `new-…`
  remoteId?: string; // server id; absent for unsaved
  title: string;
  description: string;
  price: number;
};

const API_BASE = `${import.meta.env.VITE_PORT}/api/v1/user/scout-services`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const toDraft = (s: ScoutService): DraftService => ({
  id: s.id,
  remoteId: s.id,
  title: s.title,
  description: s.description || "",
  price: s.price,
});

const ScoutServices: React.FC = () => {
  const [services, setServices] = useState<ScoutService[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drafts, setDrafts] = useState<DraftService[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState<{
    title: string;
    description: string;
    price: number;
  }>({ title: "", description: "", price: 0 });
  const newIdCounter = useRef(0);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, { headers: authHeaders() });
      setServices(res.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load scout services:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load services",
        text:
          err.response?.data?.error ||
          err.message ||
          "Could not fetch your services",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const startEditing = () => {
    setDrafts(services.map(toDraft));
    setDeletedIds([]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDrafts([]);
    setDeletedIds([]);
    setIsEditing(false);
  };

  const updateDraft = (
    index: number,
    field: keyof DraftService,
    value: string | number,
  ) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDraft = (index: number) => {
    setDrafts((prev) => {
      const removed = prev[index];
      if (removed.remoteId) {
        setDeletedIds((ids) => [...ids, removed.remoteId!]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const openAddModal = () => {
    setNewService({ title: "", description: "", price: 0 });
    setShowAddModal(true);
  };

  const submitAddModal = () => {
    if (!newService.title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Title is required",
      });
      return;
    }
    if (Number(newService.price) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Price must be greater than zero",
      });
      return;
    }
    newIdCounter.current += 1;
    setDrafts((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${newIdCounter.current}`,
        title: newService.title.trim(),
        description: newService.description.trim(),
        price: Number(newService.price),
      },
    ]);
    setShowAddModal(false);
  };

  const handleSave = async () => {
    for (const d of drafts) {
      if (!d.title.trim()) {
        Swal.fire({ icon: "error", title: "Every service needs a title" });
        return;
      }
      if (Number(d.price) <= 0) {
        Swal.fire({
          icon: "error",
          title: "Price must be greater than zero",
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      for (const id of deletedIds) {
        await axios.delete(`${API_BASE}/${id}`, { headers: authHeaders() });
      }

      for (const d of drafts) {
        const payload = {
          title: d.title.trim(),
          description: d.description.trim() || null,
          price: Number(d.price),
        };
        if (d.remoteId) {
          await axios.patch(`${API_BASE}/${d.remoteId}`, payload, {
            headers: authHeaders(),
          });
        } else {
          await axios.post(API_BASE, payload, { headers: authHeaders() });
        }
      }

      Swal.fire({
        icon: "success",
        title: "Services updated",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsEditing(false);
      setDrafts([]);
      setDeletedIds([]);
      await fetchServices();
    } catch (err: any) {
      console.error("Scout service save error:", err);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text:
          err.response?.data?.error ||
          err.message ||
          "Could not save your services",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          My Scouting Services
        </h2>
        {!isEditing ? (
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={startEditing}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit Services
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full" />
                  Saving…
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

      {isEditing && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={openAddModal}
            disabled={isSaving}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add a service
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing ? (
          drafts.length > 0 ? (
            drafts.map((d, index) => (
              <Card
                key={d.id}
                className="p-4 shadow-sm dark:bg-gray-700 relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => removeDraft(index)}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <Input
                      value={d.title}
                      onChange={(e) =>
                        updateDraft(index, "title", e.target.value)
                      }
                      disabled={isSaving}
                      placeholder="e.g. Match Day Scouting Report"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={d.description}
                      onChange={(e) =>
                        updateDraft(index, "description", e.target.value)
                      }
                      className="min-h-[100px]"
                      disabled={isSaving}
                      placeholder="What does this service include?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (£)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={d.price}
                      onChange={(e) =>
                        updateDraft(index, "price", e.target.valueAsNumber || 0)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
              No services yet. Click “Add a service” to create one.
            </div>
          )
        ) : services.length > 0 ? (
          services.map((s) => (
            <Card key={s.id} className="shadow-md dark:bg-gray-700">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <span className="text-lg text-red-600 font-semibold">
                    £{s.price}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {s.description || "No description provided"}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
            {loading
              ? "Loading…"
              : 'No services yet. Click "Edit Services" to add some.'}
          </div>
        )}
      </div>

      {showAddModal && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-xs z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Add a service
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <Input
                    autoFocus
                    value={newService.title}
                    onChange={(e) =>
                      setNewService((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Match Day Scouting Report"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What does this service include?"
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (£) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={newService.price}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        price: e.target.valueAsNumber || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={submitAddModal}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScoutServices;
