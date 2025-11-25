import { useState, useEffect } from "react";
import { useRolesAndPermissions, validateEmail, validatePassword } from "../hooks/useUsersApi";

const CreateUserModal = ({ isOpen, onClose, formData, setFormData, onSubmit, mutation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    checks: {}
  });

  // Fetch roles for selection
  const { data: rolesData, isLoading: rolesLoading } = useRolesAndPermissions();
  const roles = rolesData?.roles || [];

  // Validate password on change
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
    }
  }, [formData.password]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle role selection
  const handleRoleChange = (e) => {
    const selectedRoleId = parseInt(e.target.value);
    const selectedRole = roles.find(role => role.id === selectedRoleId);
    
    setFormData(prev => ({
      ...prev,
      roleId: selectedRoleId,
      roleName: selectedRole?.name || ""
    }));
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.firstName?.trim() &&
      formData.lastName?.trim() &&
      formData.email?.trim() &&
      validateEmail(formData.email) &&
      formData.password &&
      passwordValidation.isValid
    );
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setPasswordValidation({ isValid: false, checks: {} });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Create New User
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              required
              disabled={mutation.isPending}
              className="input-treegar w-full disabled:opacity-50"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              required
              disabled={mutation.isPending}
              className="input-treegar w-full disabled:opacity-50"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              required
              disabled={mutation.isPending}
              className={`input-treegar w-full disabled:opacity-50 ${
                formData.email && !validateEmail(formData.email) 
                  ? "border-red-500 focus:border-red-500" 
                  : ""
              }`}
              placeholder="Enter email address"
            />
            {formData.email && !validateEmail(formData.email) && (
              <p className="text-xs text-red-400 mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                required
                disabled={mutation.isPending}
                className="input-treegar w-full pr-12 disabled:opacity-50"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`h-1 flex-1 rounded ${passwordValidation.checks.minLength ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className={`h-1 flex-1 rounded ${passwordValidation.checks.hasUpperCase ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className={`h-1 flex-1 rounded ${passwordValidation.checks.hasLowerCase ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className={`h-1 flex-1 rounded ${passwordValidation.checks.hasNumbers ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                </div>
                <div className="text-xs space-y-1">
                  <div className={`flex items-center space-x-2 ${passwordValidation.checks.minLength ? 'text-green-400' : 'text-gray-400'}`}>
                    <span>{passwordValidation.checks.minLength ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasUpperCase ? 'text-green-400' : 'text-gray-400'}`}>
                    <span>{passwordValidation.checks.hasUpperCase ? '✓' : '○'}</span>
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasLowerCase ? 'text-green-400' : 'text-gray-400'}`}>
                    <span>{passwordValidation.checks.hasLowerCase ? '✓' : '○'}</span>
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasNumbers ? 'text-green-400' : 'text-gray-400'}`}>
                    <span>{passwordValidation.checks.hasNumbers ? '✓' : '○'}</span>
                    <span>One number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="roleId"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId || ""}
              onChange={handleRoleChange}
              disabled={mutation.isPending || rolesLoading}
              className="input-treegar w-full disabled:opacity-50"
            >
              <option value="">Select a role (optional)</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Role can be assigned later if not selected now
            </p>
          </div>

          {/* Error Display */}
          {mutation.isError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">
                    {mutation.error?.message || "Failed to create user"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 btn-treegar-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isFormValid()}
              className="flex-1 btn-treegar-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;