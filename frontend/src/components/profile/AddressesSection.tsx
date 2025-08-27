"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiBriefcase,
  FiX,
  FiPhone,
} from "react-icons/fi";

type AddressType = "home" | "work" | "other";
const STORAGE_KEY = "user_addresses";

interface Address {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AddressFormData
  extends Omit<Address, "id" | "createdAt" | "updatedAt"> {
  lastName?: string;
}

const initialFormData: AddressFormData = {
  type: "home",
  fullName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Load addresses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Address[] = JSON.parse(saved);
        if (parsed.length > 0 && !parsed.some((a) => a.isDefault)) {
          parsed[0].isDefault = true;
        }
        setAddresses(parsed);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever addresses change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    }
  }, [addresses, isLoading]);

  // ------------------ Form Validation ------------------
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ------------------ Handlers ------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  const resetForm = () => setFormData(initialFormData);

  const handleAddAddress = () => {
    if (!validateForm()) return;
    const now = new Date().toISOString();
    const { lastName, ...addressData } = formData;
    const newAddress: Address = {
      ...addressData,
      id: `addr_${Date.now()}`,
      isDefault: addresses.length === 0 ? true : formData.isDefault,
      createdAt: now,
      updatedAt: now,
    };
    setAddresses((prev) => {
      const updated = prev.map((a) => ({
        ...a,
        isDefault: newAddress.isDefault ? false : a.isDefault,
      }));
      return [...updated, newAddress];
    });
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress || !validateForm()) return;
    const now = new Date().toISOString();
    const { lastName, ...addressData } = formData;
    const updatedAddress: Address = {
      ...addressData,
      id: editingAddress.id,
      isDefault: formData.isDefault,
      createdAt: editingAddress.createdAt,
      updatedAt: now,
    };
    setAddresses((prev) =>
      prev.map((a) => (a.id === editingAddress.id ? updatedAddress : a))
    );
    resetForm();
    setEditingAddress(null);
    setIsAdding(false);
  };

  const handleDeleteAddress = (id: string) => {
    const now = new Date().toISOString();
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true, updatedAt: now };
      }
      return filtered;
    });
    setAddressToDelete(null);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      type: address.type,
      fullName: address.fullName,
      lastName: "",
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setIsAdding(true);
  };

  const getAddressIcon = (type: AddressType) =>
    type === "home" ? (
      <FiHome className="w-5 h-5 text-gray-500" />
    ) : type === "work" ? (
      <FiBriefcase className="w-5 h-5 text-gray-500" />
    ) : (
      <FiMapPin className="w-5 h-5 text-gray-500" />
    );
    
  const getAddressTypeLabel = (type: AddressType) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="space-y-6">
      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {(isAdding || editingAddress) && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            onClick={() => {
              setIsAdding(false);
              setEditingAddress(null);
            }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-4 relative shadow-lg"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg text-gray-500 font-medium">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAddress(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 "
                >
                  <FiX className="w-5 h-5 cursor-pointer" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Address Type Selector */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { type: 'home', label: 'Home', icon: <FiHome className="w-5 h-5" /> },
                    { type: 'work', label: 'Work', icon: <FiBriefcase className="w-5 h-5" /> },
                    { type: 'other', label: 'Other', icon: <FiMapPin className="w-5 h-5" /> },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: item.type as AddressType }))}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors cursor-pointer ${formData.type === item.type ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className={`mb-1 ${formData.type === item.type ? 'text-black' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      <span className={`text-sm font-medium ${formData.type === item.type ? 'text-black' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 text-gray-500 rounded"
                  placeholder="Full Name"
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-600">{formErrors.fullName}</p>
                )}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 text-gray-500 rounded"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 text-gray-500 rounded"
                  placeholder="Address Line 1"
                />
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 text-gray-500 rounded"
                  placeholder="Address Line 2 (Optional)"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="border px-3 py-2 text-gray-500 rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="border px-3 py-2 text-gray-500 rounded"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="border px-3 py-2 text-gray-500 rounded"
                    placeholder="Postal Code"
                  />
                </div>
            
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-gray-500">
                    Set as default address
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  className="px-4 py-2 text-gray-500 rounded border cursor-pointer"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-black text-white cursor-pointer"
                  onClick={
                    editingAddress ? handleUpdateAddress : handleAddAddress
                  }
                >
                  {editingAddress ? "Update" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddressToDelete(null)}
          >
            <motion.div
              className="bg-white rounded-lg w-full max-w-md p-6 space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg text-gray-500 font-medium">
                Delete Address
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this address?
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAddress(addressToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-gray-500 font-semibold">My Addresses</h2>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-500 cursor-pointer"
        >
          <FiPlus className="mr-2" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-4 border rounded ${
                address.isDefault ? "border-black" : "border-gray-300"
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 px-2 text-xs bg-black text-white rounded-full">
                  Default
                </span>
              )}
              <div className="flex items-start space-x-2 text-gray-500">
                {getAddressIcon(address.type)}
                <div>
                  <p className="font-medium">{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="mt-2 flex items-center">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {address.phone}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-sm text-black"
                >
                  <FiEdit2 className="inline w-5 h-5 mr-1 cursor-pointer" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddressToDelete(address);
                  }}
                  className="text-sm text-red-600"
                >
                  <FiTrash2 className="inline w-5 h-5 mr-1 cursor-pointer" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
