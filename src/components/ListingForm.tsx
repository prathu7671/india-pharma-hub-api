import React, { useState } from 'react';
import { Building2Icon, SaveIcon, XIcon, PlusCircle, MinusCircle } from 'lucide-react';
import { services, serviceCategories } from '../data/services';

interface ListingFormProps {
  onClose: () => void;
}

interface TeamMember {
  name: string;
  position: string;
  qualification: string;
  linkedIn: string;
}

interface InfrastructureItem {
  name: string;
  model: string;
  specifications: string;
  quantity: number;
}

interface Infrastructure {
  category: string;
  items: InfrastructureItem[];
}

export default function ListingForm({ onClose }: ListingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contact: '',
    email: '',
    website: '',
    category: '',
    services: [] as string[],
    compliances: [] as string[],
    review: '',
    teamSize: {
      research: 0,
      technical: 0,
      support: 0
    },
    keyOfficials: [] as TeamMember[],
    infrastructure: [] as Infrastructure[],
    customServices: [] as string[]
  });

  const availableCompliances = [
    'US FDA', 'EU GMP', 'WHO GMP', 'NABL', 'ISO 9001:2015',
    'ICH-GCP', 'DCGI', 'ANVISA', 'AAALAC', 'ISO 14001',
    'OHSAS 18001', 'ISO 17025', 'GDP', 'FSSAI'
  ];

  const [newService, setNewService] = useState('');
  const [newInfraCategory, setNewInfraCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          services: [...formData.services, ...formData.customServices]
        })
      });
      
      if (!response.ok) throw new Error('Failed to create listing');
      
      alert('Service listed successfully!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleComplianceToggle = (compliance: string) => {
    setFormData(prev => ({
      ...prev,
      compliances: prev.compliances.includes(compliance)
        ? prev.compliances.filter(c => c !== compliance)
        : [...prev.compliances, compliance]
    }));
  };

  const addCustomService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        customServices: [...prev.customServices, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeCustomService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customServices: prev.customServices.filter((_, i) => i !== index)
    }));
  };

  const addKeyOfficial = () => {
    setFormData(prev => ({
      ...prev,
      keyOfficials: [...prev.keyOfficials, {
        name: '',
        position: '',
        qualification: '',
        linkedIn: ''
      }]
    }));
  };

  const updateKeyOfficial = (index: number, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyOfficials: prev.keyOfficials.map((official, i) => 
        i === index ? { ...official, [field]: value } : official
      )
    }));
  };

  const removeKeyOfficial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyOfficials: prev.keyOfficials.filter((_, i) => i !== index)
    }));
  };

  const addInfrastructureCategory = () => {
    if (newInfraCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        infrastructure: [...prev.infrastructure, {
          category: newInfraCategory.trim(),
          items: []
        }]
      }));
      setNewInfraCategory('');
    }
  };

  const addInfrastructureItem = (categoryIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infrastructure: prev.infrastructure.map((category, i) => 
        i === categoryIndex ? {
          ...category,
          items: [...category.items, {
            name: '',
            model: '',
            specifications: '',
            quantity: 1
          }]
        } : category
      )
    }));
  };

  const updateInfrastructureItem = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof InfrastructureItem,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      infrastructure: prev.infrastructure.map((category, i) => 
        i === categoryIndex ? {
          ...category,
          items: category.items.map((item, j) => 
            j === itemIndex ? { ...item, [field]: value } : item
          )
        } : category
      )
    }));
  };

  return (
    <div className="relative max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <XIcon className="h-6 w-6" />
      </button>

      <div className="flex items-center mb-6">
        <Building2Icon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold ml-2">List Your Service</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              {serviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </div>

        {/* Description and Review */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Client Review/Testimonial</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Share a client testimonial or key achievement..."
            />
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Services Offered</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {services
              .filter(service => !formData.category || service.category === formData.category)
              .map(service => (
                <label key={service.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    checked={formData.services.includes(service.title)}
                    onChange={() => handleServiceToggle(service.title)}
                  />
                  <span className="ml-2 text-sm text-gray-600">{service.title}</span>
                </label>
              ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add custom service..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
            />
            <button
              type="button"
              onClick={addCustomService}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>

          {formData.customServices.length > 0 && (
            <div className="space-y-2">
              {formData.customServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">{service}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomService(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Size */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Size</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Research Team</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.teamSize.research}
                onChange={(e) => setFormData({
                  ...formData,
                  teamSize: { ...formData.teamSize, research: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Technical Staff</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.teamSize.technical}
                onChange={(e) => setFormData({
                  ...formData,
                  teamSize: { ...formData.teamSize, technical: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Staff</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.teamSize.support}
                onChange={(e) => setFormData({
                  ...formData,
                  teamSize: { ...formData.teamSize, support: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </div>

        {/* Key Officials */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Key Officials</h3>
            <button
              type="button"
              onClick={addKeyOfficial}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Official
            </button>
          </div>

          <div className="space-y-4">
            {formData.keyOfficials.map((official, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Official #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeKeyOfficial(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={official.name}
                      onChange={(e) => updateKeyOfficial(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={official.position}
                      onChange={(e) => updateKeyOfficial(index, 'position', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualification</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={official.qualification}
                      onChange={(e) => updateKeyOfficial(index, 'qualification', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={official.linkedIn}
                      onChange={(e) => updateKeyOfficial(index, 'linkedIn', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Infrastructure</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add category..."
                value={newInfraCategory}
                onChange={(e) => setNewInfraCategory(e.target.value)}
              />
              <button
                type="button"
                onClick={addInfrastructureCategory}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {formData.infrastructure.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">{category.category}</h4>
                  <button
                    type="button"
                    onClick={() => addInfrastructureItem(categoryIndex)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={item.name}
                          onChange={(e) => updateInfrastructureItem(categoryIndex, itemIndex, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={item.model}
                          onChange={(e) => updateInfrastructureItem(categoryIndex, itemIndex, 'model', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Specifications</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={item.specifications}
                          onChange={(e) => updateInfrastructureItem(categoryIndex, itemIndex, 'specifications', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={item.quantity}
                          onChange={(e) => updateInfrastructureItem(categoryIndex, itemIndex, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications & Compliances</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableCompliances.map(compliance => (
              <label key={compliance} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  checked={formData.compliances.includes(compliance)}
                  onChange={() => handleComplianceToggle(compliance)}
                />
                <span className="ml-2 text-sm text-gray-600">{compliance}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Submit Listing
          </button>
        </div>
      </form>
    </div>
  );
}