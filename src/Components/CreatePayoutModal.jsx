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
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  // Fetch banks list
  const { data: banks = [], isLoading: banksLoading } = useProviderBanks();

  // Account resolution mutation
  const resolveAccountMutation = useResolveAccount();

  // Filter banks - simple and effective like the working version
  const filteredBanks = banks
    .filter(bank => 
      bank.bankName.toLowerCase().includes(bankSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const term = bankSearchTerm.toLowerCase();
      const aName = a.bankName.toLowerCase();
      const bName = b.bankName.toLowerCase();
      
      // Exact match first
      if (aName === term) return -1;
      if (bName === term) return 1;
      
      // Starts with next
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;
      
      // Alphabetical fallback
      return aName.localeCompare(bName);
    })
    .slice(0, 10); // Limit results for better UX

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

  // Handle bank selection - mirror working version
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setBankSearchTerm(bank.bankName);
    setFormData((prev) => ({
      ...prev,
      beneficiaryBankCode: bank.bankCode,
      bankName: bank.bankName,
    }));
    setShowBankDropdown(false);
    setAccountResolved(false);
    setResolvedAccountName("");
  };

  // Handle bank search - mirror working version
  const handleBankSearch = (value) => {
    setBankSearchTerm(value);
    setShowBankDropdown(true);
    
    // Clear selection if user is typing something different
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
      formData.beneficiaryAccountNumber?.length === 10 &&
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
      setBankSearchTerm("");
      setSelectedBank(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Create New Payout
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={mutation.isPending}
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
          {/* Amount Input - Fixed overlapping Naira symbol */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10">
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
                className="input-treegar pl-9 w-full disabled:opacity-50"
                placeholder="0.00"
                style={{ paddingLeft: '2.25rem' }} // Ensure enough space for Naira symbol
              />
            </div>
            {formData.amount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Amount: ₦{parseAmount(formData.displayAmount || "0").toLocaleString()}
              </p>
            )}
          </div>

          {/* Bank Selection - Mirrored from working version */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beneficiary Bank *
            </label>
            <input
              type="text"
              value={bankSearchTerm}
              onChange={(e) => handleBankSearch(e.target.value)}
              onFocus={() => setShowBankDropdown(true)}
              disabled={banksLoading || mutation.isPending}
              placeholder="Search for a bank..."
              className="input-treegar w-full disabled:opacity-50"
            />
            
            {/* Bank Dropdown */}
            {showBankDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {banksLoading ? (
                  <div className="px-4 py-8 text-center">
                    <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="text-gray-400 text-sm">Loading banks...</div>
                  </div>
                ) : filteredBanks.length > 0 ? (
                  filteredBanks.map((bank) => (
                    <button
                      key={bank.bankCode}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className="w-full px-3 py-2 text-left hover:bg-dark-600 focus:bg-dark-600 focus:outline-none border-b border-dark-600 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-white">{bank.bankName}</div>
                      <div className="text-xs text-gray-400">{bank.bankCode}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">
                    {bankSearchTerm ? `No banks found matching "${bankSearchTerm}"` : "Start typing to search banks"}
                  </div>
                )}
              </div>
            )}
            
            {/* Click outside to close dropdown */}
            {showBankDropdown && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowBankDropdown(false)}
              ></div>
            )}
            
            {selectedBank && (
              <p className="text-green-400 text-xs mt-1">✓ {selectedBank.bankName} selected</p>
            )}
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
                placeholder="Enter 10-digit account number"
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
            {isResolvingAccount && (
              <p className="text-xs text-blue-400 mt-1">
                🔄 Resolving account name...
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
            <textarea
              id="narration"
              name="narration"
              value={formData.narration || ""}
              onChange={handleInputChange}
              required
              disabled={mutation.isPending}
              rows="3"
              className="input-treegar w-full disabled:opacity-50 resize-none"
              placeholder="Enter payment description"
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
                !formData.narration ||
                !formData.beneficiaryBankCode
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