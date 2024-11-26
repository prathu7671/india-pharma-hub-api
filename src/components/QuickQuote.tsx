import React, { useState } from 'react';
import { Send, FileText, Calendar, IndianRupee } from 'lucide-react';
import type { Provider } from '../types/service';

interface QuickQuoteProps {
  provider: Provider;
  onClose: () => void;
}

export default function QuickQuote({ provider, onClose }: QuickQuoteProps) {
  const [formData, setFormData] = useState({
    projectType: '',
    timeline: '',
    budget: '',
    description: '',
    documents: null as File[] | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quote requested:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Request Quick Quote</h2>
        <p className="text-gray-600 mb-6">
          Get a quick response from {provider.name} for your project
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <select
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            >
              <option value="">Select project type</option>
              {provider.services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Timeline
              </label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              >
                <option value="">Select timeline</option>
                <option value="1-3">1-3 months</option>
                <option value="3-6">3-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12+">12+ months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <IndianRupee className="inline-block w-4 h-4 mr-1" />
                Budget Range
              </label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              >
                <option value="">Select budget range</option>
                <option value="1-5">₹1L - ₹5L</option>
                <option value="5-20">₹5L - ₹20L</option>
                <option value="20-50">₹20L - ₹50L</option>
                <option value="50+">₹50L+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              required
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe your project requirements..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline-block w-4 h-4 mr-1" />
              Attach Documents (Optional)
            </label>
            <input
              type="file"
              multiple
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFormData({ ...formData, documents: e.target.files ? Array.from(e.target.files) : null })}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Quote Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}