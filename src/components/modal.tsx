import React from 'react';
import { CheckCircle, AlertCircle, X } from "lucide-react";

// Defining the Interface for Props
interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Added to handle the primary action (Go to cart)
  message: string;
  type: 'success' | 'error';
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onConfirm, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
        
        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon Status */}
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {type === 'success' ? (
            <CheckCircle size={32} />
          ) : (
            <AlertCircle size={32} />
          )}
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-gray-900">
          {type === 'success' ? 'Success!' : 'Something went wrong'}
        </h3>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3 rounded-md text-white font-medium transition-all active:scale-95 ${
              type === 'success' ? 'bg-[#DB4444] hover:bg-red-600' : 'bg-gray-800 hover:bg-black'
            }`}
          >
            {type === 'success' ? 'View Cart & Checkout' : 'Try Again'}
          </button>
          
          {type === 'success' && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              Continue Shopping
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;