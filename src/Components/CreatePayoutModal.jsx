import { useState, useEffect } from "react";
import { useProviderBanks, useResolveAccount } from "../hooks/usePayoutApi";

const CreatePayoutModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  mutation,
}) => {
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  // Fetch banks list
  const { data: banks = [], isLoading: banksLoading } = useProviderBanks();

  // Account resolution mutation
  const resolveAccountMutation = useResolveAccount();

  const filteredBanks = banks
    .filter((bank) => {
      const term = searchTerm.toLowerCase();
      return (
        bank.bankName?.toLowerCase().includes(term) ||
        bank.bankCode?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const term = searchTerm.toLowerCase();

      const aName = a.bankName.toLowerCase();
      const bName = b.bankName.toLowerCase();

      // 1️⃣ Exact match comes first
      if (aName === term && bName !== term) return -1;
      if (bName === term && aName !== term) return 1;

      // 2️⃣ Starts-with comes second
      const aStarts = aName.startsWith(term);
      const bStarts = bName.startsWith(term);

      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;

      // 3️⃣ Shorter name (often the real bank) comes next
      if (aName.length !== bName.length) {
        return aName.length - bName.length;
      }

      // 4️⃣ Alphabetical fallback
      return aName.localeCompare(bName);
    });

  // Format amount input with commas
  const formatAmountDisplay = (value) => {
    if (!value) return "";
    // Remove any non-numeric characters except decimal point
    const numericValue = value.toString().replace(/[^0-9.]/g, "");
    // Add commas for thousands
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Parse amount removing commas for API submission
  const parseAmount = (formattedAmount) => {
    return parseFloat(formattedAmount.replace(/,/g, "")) || 0;
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatAmountDisplay(value);
    setFormData((prev) => ({
      ...prev,
      displayAmount: formattedValue,
      amount: parseAmount(formattedValue),
    }));
  };

  // Handle bank selection
  const handleBankSelect = (bank) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaryBankCode: bank.bankCode,
      bankName: bank.bankName,
    }));

    setSelectedBank(bank);
    setShowBankDropdown(false);
    setSearchTerm(""); // FIXED

    setAccountResolved(false);
    setResolvedAccountName("");
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setShowBankDropdown(true);

    // If user types away from selected bank → clear selection
    if (selectedBank && value !== selectedBank.bankName) {
      setSelectedBank(null);

      setFormData((prev) => ({
        ...prev,
        beneficiaryBankCode: "",
        bankName: "",
      }));

      setAccountResolved(false);
      setResolvedAccountName("");
    }
  };

  // Handle account number change
  const handleAccountNumberChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      beneficiaryAccountNumber: value,
    }));
    // Reset resolution when account number changes
    setAccountResolved(false);
    setResolvedAccountName("");
  };

  // Handle account resolution
  const handleResolveAccount = async () => {
    if (!formData.beneficiaryAccountNumber || !formData.beneficiaryBankCode) {
      return;
    }

    setIsResolvingAccount(true);

    try {
      const response = await resolveAccountMutation.mutateAsync({
        accountNumber: formData.beneficiaryAccountNumber,
        bankCode: formData.beneficiaryBankCode,
      });

      if (response.data?.accountName) {
        setResolvedAccountName(response.data.accountName);
        setFormData((prev) => ({
          ...prev,
          beneficiaryAccountName: response.data.accountName,
        }));
        setAccountResolved(true);
      }
    } catch (error) {
      console.error("Account resolution failed:", error);
      setAccountResolved(false);
      setResolvedAccountName("");
    } finally {
      setIsResolvingAccount(false);
    }
  };

  // Auto-resolve account when both account number and bank code are available
  useEffect(() => {
    if (
      formData.beneficiaryAccountNumber?.length >= 10 &&
      formData.beneficiaryBankCode
    ) {
      const timer = setTimeout(() => {
        if (!accountResolved && !isResolvingAccount) {
          handleResolveAccount();
        }
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [formData.beneficiaryAccountNumber, formData.beneficiaryBankCode]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAccountResolved(false);
      setResolvedAccountName("");
      setShowBankDropdown(false);
      setSearchTerm(""); // FIXED
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Create New Payout
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
          {/* Amount Input */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                ₦
              </span>
              <input
                type="text"
                id="amount"
                name="displayAmount"
                value={formData.displayAmount || ""}
                onChange={handleAmountChange}
                required
                disabled={mutation.isPending}
                className="input-treegar pl-8 w-full disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
            {formData.amount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Amount: ₦
                {parseAmount(formData.displayAmount || "0").toLocaleString()}
              </p>
            )}
          </div>

          {/* Bank Selection */}
          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beneficiary Bank
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
                disabled={banksLoading || mutation.isPending}
                className="input-treegar w-full text-left flex items-center justify-between"
              >
                <span className={selectedBank ? "text-white" : "text-gray-400"}>
                  {selectedBank ? selectedBank.bankName : "Select a bank..."}
                </span>

                <svg
                  className={`w-4 h-4 transition-transform ${
                    showBankDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showBankDropdown && (
                <div className="absolute top-full left-0 right-0 bg-dark-700 border border-dark-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
                  {/* SEARCH BAR */}
                  <div className="p-3 border-b border-dark-600">
                    <input
                      type="text"
                      placeholder="Search banks..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      autoFocus
                      className="w-full bg-dark-800 border border-dark-600 text-white text-sm rounded px-3 py-2"
                    />
                  </div>

                  {/* LIST */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-dark-600">
                    {filteredBanks.length ? (
                      filteredBanks.map((bank) => (
                        <button
                          key={bank.bankCode}
                          onClick={() => handleBankSelect(bank)}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-dark-600 flex justify-between"
                        >
                          <div>
                            <div className="text-white text-sm">
                              {bank.bankName}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {bank.bankCode}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-400 text-sm">
                        No banks found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Number Input */}
          <div>
            <label
              htmlFor="beneficiaryAccountNumber"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="beneficiaryAccountNumber"
                name="beneficiaryAccountNumber"
                value={formData.beneficiaryAccountNumber || ""}
                onChange={handleAccountNumberChange}
                required
                disabled={mutation.isPending}
                className="input-treegar w-full pr-12 disabled:opacity-50"
                placeholder="Enter account number"
                maxLength={10}
              />
              {formData.beneficiaryAccountNumber &&
                formData.beneficiaryBankCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isResolvingAccount ? (
                      <svg
                        className="animate-spin h-4 w-4 text-primary-500"
                        fill="none"
                        stroke="currentColor"
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
                    ) : accountResolved ? (
                      <div className="text-green-400">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                )}
            </div>
            {resolvedAccountName && (
              <p className="text-xs text-green-400 mt-1">
                ✓ Account Name: {resolvedAccountName}
              </p>
            )}
            {resolveAccountMutation.isError && (
              <p className="text-xs text-red-400 mt-1">
                Failed to resolve account. Please check the details.
              </p>
            )}
          </div>

          {/* Narration Input */}
          <div>
            <label
              htmlFor="narration"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Narration
            </label>
            <input
              type="text"
              id="narration"
              name="narration"
              value={formData.narration || ""}
              onChange={handleInputChange}
              required
              disabled={mutation.isPending}
              className="input-treegar w-full disabled:opacity-50"
              placeholder="Payment description"
              maxLength={100}
            />
          </div>

          {/* Currency (Hidden but set to NGN) */}
          <input type="hidden" name="currency" value="NGN" />

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
                    {mutation.error?.message || "Failed to create payout"}
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
              disabled={
                mutation.isPending ||
                !accountResolved ||
                !formData.amount ||
                formData.amount <= 0 ||
                !formData.narration
              }
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
                "Create Payout"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayoutModal;
