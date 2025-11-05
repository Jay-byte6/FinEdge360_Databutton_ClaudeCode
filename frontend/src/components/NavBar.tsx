import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useAuthStore from '../utils/authStore';

export interface NavBarProps {
  showFullNav?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showFullNav = true }) => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useAuthStore();

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
    { name: "Enter Details", path: "/enter-details" },
    { name: "FIRE Calculator", path: "/fire-calculator" },
    { name: "Net Worth", path: "/net-worth" },
    { name: "SIP Planner", path: "/sip-planner" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Tax Planning", path: "/tax-planning" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-2 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://static.databutton.com/public/c20b7149-cba2-4252-9e94-0e8406b7fcec/FinEdge360_Logo_screenshot.png" 
              alt="FinEdge360 Logo" 
              className="h-16 w-auto" 
            />
          </div>
          
          {showFullNav && (
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          )}
          
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-gray-500">{user?.email || "User"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/enter-details")}>
                    Enter Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/net-worth")}>
                    Step1: Know your reality
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/fire-calculator")}>
                    Step2: FIRE Calculator
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/portfolio")}>
                    Step3: Diversify Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/sip-planner")}>
                    Step4: Plan your SIP
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/tax-planning")}>
                    Tax Planning & ITR Filing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://wa.me/yourwhatsapplink", "_blank")}>
                    Talk to Expert
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => window.open("https://chat.whatsapp.com/yourcommunitylink", "_blank")}>
                    Join WA Community
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/feedback")}>
                    Here's My Feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    Log Out
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
