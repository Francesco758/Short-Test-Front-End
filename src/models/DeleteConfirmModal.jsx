import React from 'react';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteConfirmModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "", // Optional: name of the item being deleted
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger", // "danger", "warning"
}) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: FaExclamationTriangle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      buttonColor: "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600",
    },
    warning: {
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus-visible:outline-yellow-600",
    }
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
                {itemName && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-300">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      "{itemName}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notes */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Warning:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>This action is permanent and irreversible</li>
                <li>All associated data will be lost</li>
                <li>You cannot recover deleted items</li>
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
                : config.buttonColor
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="h-4 w-4" />
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

// Usage example:
/*
import DeleteConfirmModal from '@/src/components/DeleteConfirmModal';

function ExampleComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Perform delete operation
    console.log('Deleting:', itemToDelete);
    // Then close modal
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return (
    <div>
      <button 
        onClick={() => handleDeleteClick({ id: 1, name: "My Important Document" })}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Delete Item
      </button>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        itemName={itemToDelete?.name}
        confirmText="Delete Document"
        cancelText="Keep Document"
        variant="danger"
        isLoading={false}
      />
    </div>
  );
}
*/

// Alternative simpler version for quick use
export function SimpleDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  isLoading = false
}) {
  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemName}`}
      message={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmText={`Delete ${itemName}`}
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
}