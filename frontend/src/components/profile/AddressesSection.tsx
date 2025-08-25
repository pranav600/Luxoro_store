'use client';

import { useState } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiHome, FiBriefcase, FiX } from 'react-icons/fi';

type AddressType = 'home' | 'work' | 'other';

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
  country: string;
  isDefault: boolean;
}

export default function AddressesSection() {
  // This is mock data - replace with actual data from your backend
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      fullName: 'John Doe',
      phone: '+1 (555) 123-4567',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      isDefault: true,
    },
    {
      id: '2',
      type: 'work',
      fullName: 'John Doe',
      phone: '+1 (555) 987-6543',
      addressLine1: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10005',
      country: 'United States',
      isDefault: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    type: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  const handleAddAddress = () => {
    const newAddress = {
      ...formData,
      id: Date.now().toString(),
      isDefault: addresses.length === 0 ? true : formData.isDefault,
    };

    setAddresses(prev => {
      // If this is set as default, unset all other defaults
      if (newAddress.isDefault) {
        return [
          ...prev.map(addr => ({ ...addr, isDefault: false })),
          newAddress,
        ];
      }
      return [...prev, newAddress];
    });

    resetForm();
    setIsAdding(false);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    setAddresses(prev =>
      prev.map(addr =>
        addr.id === editingAddress.id
          ? { ...formData, id: editingAddress.id }
          : formData.isDefault
          ? { ...addr, isDefault: false }
          : addr
      )
    );

    resetForm();
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => {
      const newAddresses = prev.filter(addr => addr.id !== id);
      // If we deleted the default address and there are other addresses, set the first one as default
      if (newAddresses.length > 0 && !newAddresses.some(addr => addr.isDefault)) {
        newAddresses[0].isDefault = true;
      }
      return newAddresses;
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    const { id, ...rest } = address;
    setFormData(rest);
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: false,
    });
  };

  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case 'home':
        return <FiHome className="w-5 h-5 text-gray-500" />;
      case 'work':
        return <FiBriefcase className="w-5 h-5 text-blue-500" />;
      default:
        return <FiMapPin className="w-5 h-5 text-green-500" />;
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.phone.trim() &&
      formData.addressLine1.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.postalCode.trim() &&
      formData.country.trim()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!isAdding && !editingAddress && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <FiPlus className="-ml-1 mr-2 h-4 w-4" />
            Add New Address
          </button>
        )}
      </div>

      {(isAdding || editingAddress) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingAddress(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <div className="flex space-x-4">
                {(['home', 'work', 'other'] as AddressType[]).map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2 || ''}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province/Region
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                <option>India</option>
              </select>
            </div>

            <div className="flex items-start sm:col-span-2">
              <div className="flex items-center h-5">
                <input
                  id="isDefault"
                  name="isDefault"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isDefault" className="font-medium text-gray-700">
                  Set as default address
                </label>
                <p className="text-gray-500">Use this as my default shipping address</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingAddress(null);
                resetForm();
              }}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
              disabled={!isFormValid()}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isFormValid()
                  ? 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {editingAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </div>
      )}

      {!isAdding && !editingAddress && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-4 border rounded-lg ${
                address.isDefault ? 'border-black' : 'border-gray-200'
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
                  Default
                </span>
              )}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getAddressIcon(address.type)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 capitalize">
                    {address.type} address
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    <p>{address.fullName}</p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="mt-2">{address.phone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  <FiEdit2 className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
