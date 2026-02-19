import { useState } from "react";
import { 
  useAccessTokens, 
  useCreateAccessToken, 
  useDeleteAccessToken,
  formatTokenDate,
  getTokenStatusStyle,
  maskToken
} from "../hooks/useaccesstokenapi";

const CompanyTokens = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(-1);
  const [showNewToken, setShowNewToken] = useState(null);

  // API hooks
  const { data: tokens = [], isLoading, error, refetch } = useAccessTokens();
  const createTokenMutation = useCreateAccessToken();
  const deleteTokenMutation = useDeleteAccessToken();

  const handleCreateToken = async (e) => {
    e.preventDefault();

    try {
      const result = await createTokenMutation.mutateAsync({
        name: newTokenName,
        expiresInDays: expiresInDays
      });
      
      // Show the new token (only available during creation)
      if (result && result.accessToken) {
        setShowNewToken({
          name: newTokenName,
          token: result.accessToken
        });
      }
      
      setNewTokenName("");
      setExpiresInDays(-1);
      setShowCreateForm(false);
      
      console.log("Token created successfully");
    } catch (error) {
      console.error("Error creating token:", error);
    }
  };

  const handleDeleteToken = async (tokenId, tokenName) => {
    if (!window.confirm(`Are you sure you want to revoke the token "${tokenName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTokenMutation.mutateAsync(tokenId);
      console.log("Token deleted successfully");
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  const getExpirationText = (expiresAt) => {
    if (!expiresAt) return "Never expires";
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    if (expiry < now) return "Expired";
    
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleOpenModal = () => {
    console.log("Opening create modal - button clicked successfully!");
    console.log("Current showCreateForm state:", showCreateForm);
    setShowCreateForm(true);
    console.log("After setting showCreateForm to true");
  };

  const handleCloseModal = () => {
    console.log("Closing create modal");
    setShowCreateForm(false);
    setNewTokenName("");
    setExpiresInDays(-1);
  };

  // Add button click test
  const handleButtonTest = (e) => {
    console.log("Button area clicked!", e.target);
    console.log("Click coordinates:", e.clientX, e.clientY);
    handleOpenModal();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-400">Loading tokens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="treegar-card p-6">
          <div className="text-center py-8">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-400">Error loading tokens</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
            <button 
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-neon-cyan uppercase">
              Company Tokens
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your API keys and access tokens
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleButtonTest}
              disabled={createTokenMutation.isPending}
              type="button"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:shadow-neon-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer min-w-[160px] relative"
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                userSelect: 'none',
                zIndex: 10
              }}
            >
              <span className="pointer-events-none">
                {createTokenMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create New Token"
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Tokens List */}
        <div className="treegar-card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Active API Tokens ({tokens.length})
            </h2>
            
            {tokens.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔑</div>
                <p className="text-gray-400">No API tokens found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create your first token to start using the API
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokens.map((token) => {
                  const statusStyle = getTokenStatusStyle(token.isActive);
                  return (
                    <div
                      key={token.id}
                      className="bg-dark-700/50 border border-dark-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-white">
                              {token.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {token.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <br />
                              <span className="text-gray-300">
                                {formatTokenDate(token.createdAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Used:</span>
                              <br />
                              <span className="text-gray-300">
                                {formatTokenDate(token.lastUsedAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Expires:</span>
                              <br />
                              <span className="text-gray-300">
                                {getExpirationText(token.expiresAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-dark-800 rounded-md">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm text-gray-300">
                                Token ID: {token.id} • ••••••••••••••••
                              </span>
                              <div className="text-xs text-gray-500">
                                Token hidden for security
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => handleDeleteToken(token.id, token.name)}
                            disabled={deleteTokenMutation.isPending}
                            className="px-3 py-1 text-red-400 border border-red-400/30 rounded-md hover:bg-red-400/10 transition-colors text-sm disabled:opacity-50"
                          >
                            {deleteTokenMutation.isPending ? "Deleting..." : "Revoke"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* API Documentation Link */}
        <div className="treegar-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              API Documentation
            </h3>
            <p className="text-gray-400 mb-4">
              Learn how to integrate with our API and use your tokens effectively.
            </p>
            <button className="px-4 py-2 border border-primary-500 text-primary-400 rounded-md hover:bg-primary-500/10 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Create Token Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Create New API Token
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-dark-700 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateToken} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Production API Key"
                    required
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiration
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value={-1}>Never expires</option>
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-dark-600 text-gray-300 rounded-md hover:bg-dark-700 transition-colors font-medium"
                    disabled={createTokenMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTokenMutation.isPending || !newTokenName.trim()}
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {createTokenMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Token"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Token Display Modal */}
      {showNewToken && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-green-400 text-5xl mb-3">✅</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Token Created Successfully!
                </h3>
                <p className="text-gray-400 text-sm">
                  Please copy your token now. For security reasons, it won't be shown again.
                </p>
              </div>
              
              <div className="bg-dark-900 border border-dark-600 rounded-lg p-4 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Name
                  </label>
                  <p className="text-white font-medium">{showNewToken.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Token
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-dark-800 text-green-400 px-3 py-3 rounded text-sm font-mono break-all border border-dark-700">
                      {showNewToken.token}
                    </code>
                    <button
                      onClick={() => copyToClipboard(showNewToken.token)}
                      className="p-3 text-gray-400 hover:text-white border border-dark-600 rounded transition-colors hover:bg-dark-700"
                      title="Copy token"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowNewToken(null)}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyTokens;