import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, HelpCircle } from 'lucide-react';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import { NotificationCenter } from './NotificationCenter';
import { SupportTicketModal } from './SupportTicketModal';

export interface NavBarProps {
  showFullNav?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showFullNav = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isAuthenticated } = useAuthStore();
  const { financialData } = useFinancialDataStore();
  const [firstName, setFirstName] = React.useState<string>('User');
  const [showSupportModal, setShowSupportModal] = React.useState(false);

  // Extract first name from profile, financial data, or email
  React.useEffect(() => {
    const getFirstName = () => {
      // Priority 1: Financial data name (from Enter Details page)
      if (financialData?.personalInfo?.name) {
        return financialData.personalInfo.name.split(' ')[0];
      }
      // Priority 2: Profile full name
      if (profile?.full_name) {
        return profile.full_name.split(' ')[0];
      }
      // Priority 3: Email prefix
      if (user?.email) {
        return user.email.split('@')[0];
      }
      return 'User';
    };

    setFirstName(getFirstName());
  }, [financialData, profile, user, location.pathname]); // Re-run when financial data, profile, user, or page changes

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "FIRE-Map", path: "/journey3d" },
    { name: "Net Worth", path: "/net-worth" },
    { name: "FIRE Calculator", path: "/fire-calculator" },
    { name: "Tax Planning", path: "/tax-planning" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "FIRE Planner", path: "/fire-planner" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-8 z-40">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center py-2 h-20">
          <div className="flex items-end cursor-pointer mr-8 md:mr-12 mt-3" onClick={() => navigate('/')}>
            <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '80px', width: 'auto' }}>
              <video
                src="/FIREMap.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-48 md:h-56 w-auto"
                style={{
                  objectFit: 'contain',
                  filter: 'contrast(1.3) brightness(1.05)',
                  mixBlendMode: 'darken',
                  transform: 'translateY(0)'
                }}
                aria-label="FIREMap - Your GPS to Financial Freedom"
              />
            </div>
          </div>

          {showFullNav && (
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>
          )}
          
          <div className="flex items-center space-x-2">
            {isAuthenticated && <NotificationCenter />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 px-3 rounded-md hover:bg-gray-100 flex items-center gap-2" aria-label="Menu">
                    <Menu className="h-5 w-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{firstName}</p>
                      <p className="text-xs text-gray-500">{user?.email || "User"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Profile Section */}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                    👤 My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setShowSupportModal(true)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Help
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dashboard")}>
                    📊 Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/journey3d")}>
                    🗺️ Your FIRE Map
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Your Financial Journey (Milestones) */}
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-600 px-2">
                    Your Financial Journey
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/enter-details")}>
                    Step 0: Enter Your Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/net-worth")}>
                    Step 1: Know Your Net Worth
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/fire-calculator")}>
                    Step 2: Discover Your FIRE
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/tax-planning")}>
                    Step 3: Optimize Your Taxes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/portfolio")}>
                    Step 4: Assess Yourself
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/fire-planner?tab=set-goals")}>
                    Step 5: Set your Goals
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/fire-planner?tab=asset-allocation")}>
                    Step 6: Design Asset Allocation
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/fire-planner?tab=sip-plan")}>
                    Step 7: FIRE Planning
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Support & Community */}
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-600 px-2">
                    Support & Community
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setShowSupportModal(true)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Help
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/pricing")}>
                    💎 View Plans & Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/consultation-new")}>
                    📞 Book Expert Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://wa.me/yourwhatsapplink", "_blank")}>
                    💬 Talk to Expert
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://chat.whatsapp.com/yourcommunitylink", "_blank")}>
                    👥 Join Community
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/feedback")}>
                    🚀 PowerUp FIREMap
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    🚪 Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <SupportTicketModal
        open={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </header>
  );
};

export default NavBar;
