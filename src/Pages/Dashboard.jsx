import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLogout } from '../hooks/useApi'
import Transactions from './Transactions'
import Accounts from './Accounts'
import Payouts from './Payout'
import Users from './Users'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  
  // Get current location and navigation
  const location = useLocation()
  const navigate = useNavigate()
  
  // Extract the active tab from the URL path
  const currentPath = location.pathname
  const activeTab = currentPath.split('/')[2] || 'transactions' // Get the part after '/dashboard/'

  // Get auth context and logout mutation
  const { user, logout } = useAuth()
  const logoutMutation = useLogout()

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate()
  }

  // Get user display info
  const userDisplayName = user?.firstName || 'User'
  const userInitial = userDisplayName.charAt(0).toUpperCase()
  const userRole = user?.companyName || 'System Administrator'
  const userEmail = user?.email || ''

  const menuItems = [
    { id: 'transactions', name: 'Transactions', icon: '💳', description: 'Payment History' },
    { id: 'accounts', name: 'Accounts', icon: '💰', description: 'Virtual Assets' },
    { id: 'payouts', name: 'Payouts', icon: '💸', description: 'Disbursements' },
    { id: 'users', name: 'Users', icon: '👥', description: 'User Management' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return <Accounts />

      case 'transactions':
        return <Transactions />
      
      case 'payouts':
        return <Payouts/>

      case 'users':
        return <Users/>

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-neon-cyan uppercase">{activeTab}</h1>
            <div className="treegar-card p-6">
              <p className="text-gray-300">{activeTab} module will be implemented here.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gradient-treegar particles-bg">
      {/* Click outside handler for dropdowns */}
      {(sidebarOpen || profileDropdownOpen) && (
        <div 
          className={`fixed inset-0 z-30 ${sidebarOpen ? 'md:hidden' : ''}`}
          onClick={() => {
            setSidebarOpen(false)
            setProfileDropdownOpen(false)
          }}
        ></div>
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 md:hidden"></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 flex flex-col w-72 sidebar-treegar backdrop-blur-md transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-dark-900 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <img src="/Images/logo.png" alt="Treegar X Corp" className="h-8 w-8" />
            <div>
              <h1 className="text-sm font-bold">
                <span className="text-gradient-cyan">TREEGAR X </span>
                <span className="text-gradient-purple">CORP</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/dashboard/${item.id}`)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-glow-cyan text-white shadow-neon-cyan' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </div>
              {activeTab === item.id && (
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-700/50">
            <div className="w-10 h-10 bg-gradient-cyan rounded-full flex items-center justify-center text-dark-900 font-bold">
              {userInitial}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{userDisplayName}</p>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
            <button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Logout"
            >
              {logoutMutation.isPending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="nav-treegar flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 md:hidden transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white capitalize">{activeTab}</h2>
              <p className="text-xs text-gray-400">Financial Infrastructure</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">OPERATIONAL</span>
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-md transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5-1.5 1.5m-5 2h5l-3.5-3.5-1.5 1.5M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-cyan rounded-full flex items-center justify-center text-dark-900 font-bold text-sm">
                  {userInitial}
                </div>
                <span className="hidden md:block text-sm font-medium text-white">{userDisplayName}</span>
                <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-dark-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-cyan rounded-full flex items-center justify-center text-dark-900 font-bold">
                        {userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{userDisplayName}</p>
                        <p className="text-xs text-gray-400">{userEmail}</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        // Add profile settings functionality later
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-dark-700 rounded-md transition-colors disabled:opacity-50"
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard