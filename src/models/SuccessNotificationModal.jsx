import React from 'react';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

export default function SuccessNotificationModal({
  isOpen = false,
  onClose,
  title = "Success",
  message = "Operation completed successfully!",
  type = "success", // "success", "info", "warning"
  duration = 3000, // Auto-close duration in milliseconds (0 to disable)
  showCloseButton = true,
  customContent,
}) {
  if (!isOpen) return null;

  // Auto-close functionality
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const typeConfig = {
    success: {
      icon: FaCheck,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      titleColor: "text-green-800",
      messageColor: "text-green-700",
    },
    info: {
      icon: FaInfoCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      titleColor: "text-blue-800",
      messageColor: "text-blue-700",
    },
    warning: {
      icon: FaInfoCircle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      titleColor: "text-yellow-800",
      messageColor: "text-yellow-700",
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Modal - Always centered */}
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl border">
        {/* Header */}
        <div className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${config.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className={`text-base font-semibold ${config.titleColor}`}>
                {title}
              </h3>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {customContent ? (
            <div className="text-sm text-gray-600">
              {customContent}
            </div>
          ) : (
            <p className={`text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}
        </div>

        {/* Auto-close indicator */}
        {duration > 0 && (
          <div className="px-6 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-[${duration}ms] ease-linear ${config.bgColor.replace('50', '500')}`}
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Auto-closing in {Math.ceil(duration / 1000)}s
            </p>
          </div>
        )}
      </div>

      {/* CSS for auto-close animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Quick success notification hook
export function useSuccessNotification() {
  const [notification, setNotification] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const showSuccess = React.useCallback((title, message, options = {}) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: "success",
      ...options
    });
  }, []);

  const showInfo = React.useCallback((title, message, options = {}) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: "info",
      ...options
    });
  }, []);

  const showWarning = React.useCallback((title, message, options = {}) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: "warning",
      ...options
    });
  }, []);

  const hideNotification = React.useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    notification,
    showSuccess,
    showInfo,
    showWarning,
    hideNotification
  };
}