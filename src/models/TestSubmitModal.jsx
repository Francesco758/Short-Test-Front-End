import React from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';

export default function TestSubmitModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Submit Assessment",
  message = "Are you sure you want to submit your test? Once submitted, you cannot make any changes.",
  confirmText = "Submit Test",
  cancelText = "Continue Editing",
  type = "warning", // "warning", "success", "info"
  isLoading = false,
  customContent,
}) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    success: {
      icon: FaCheck,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    info: {
      icon: FaPaperPlane,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal - Always centered */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className={`${config.bgColor} px-6 py-5 border-b ${config.borderColor}`}>
          <div className="flex items-center">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-1">
                <p className="text-sm text-gray-600">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Content (if provided) */}
        {customContent && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            {customContent}
          </div>
        )}

        {/* Important Notes */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>You cannot edit your responses after submission</li>
                <li>Results will be processed immediately</li>
                <li>This action is final and cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 flex-1
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane className="h-4 w-4" />
                {confirmText}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors duration-200 flex-1"
          >
            <FaTimes className="h-4 w-4 mr-2" />
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Additional component for showing submission details
export function SubmissionDetails({ items }) {
  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900">What will be submitted:</h4>
      </div>
      <div className="p-4">
        <ul className="space-y-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <FaCheck className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}