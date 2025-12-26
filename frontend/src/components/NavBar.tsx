import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useAuthStore from '../utils/authStore';
import { NotificationCenter } from './NotificationCenter';

export interface NavBarProps {
  showFullNav?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showFullNav = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isAuthenticated } = useAuthStore();

  // Extract first name from profile or email
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const firstName = getFirstName();

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
    <header className="bg-white border-b border-gray-200 py-4 px-2 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/TheFireMap_Logo.png"
              alt="TheFireMap Logo"
              className="h-24 w-auto object-contain"
            />
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
                  <Button variant="ghost" className="relative h-9 rounded-full px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">Hi, {firstName}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
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
                  <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://form.typeform.com/to/euTwDCwt", "_blank")}>
                    📝 My Feedback
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
    </header>
  );
};

export default NavBar;
