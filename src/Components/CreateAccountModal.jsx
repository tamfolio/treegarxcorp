const CreateAccountModal = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    mutation
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60  flex items-center justify-center z-50">
        <div className="treegar-card p-6 w-full max-w-md mx-4">
  
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Create New Account</h3>
  
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
  
          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={mutation.isPending}
                className="input-treegar input-with-icon-left w-full"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={mutation.isPending}
                className="input-treegar w-full"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={mutation.isPending}
                className="input-treegar w-full"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={mutation.isPending}
                className="input-treegar w-full"
                required
              />
            </div>
  
            {mutation.isError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                {mutation.error?.message || "Failed to create account"}
              </div>
            )}
  
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-treegar-outline"
                disabled={mutation.isPending}
              >
                Cancel
              </button>
  
              <button
                type="submit"
                className="flex-1 btn-treegar-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default CreateAccountModal;
  