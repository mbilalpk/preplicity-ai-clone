import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Home, Book, Search, Compass, MessageSquare, ArrowUp, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: Search, label: 'Discover', to: '/discover' },
    { icon: Book, label: 'Library', to: '/library' },
    { icon: MessageSquare, label: 'Spaces', to: '/spaces' },
  ];

  return (
    <aside className={`bg-[#F0F0EB] border-r border-gray-200 flex flex-col p-4 justify-between transition-all duration-300 ease-in-out h-full fixed ${isExpanded ? 'w-64' : 'w-20 items-center'}`}>
      
      {/* Logo */}
        <div className={`p-2 rounded-lg hover:bg-gray-200 cursor-pointer mb-6 ${isExpanded ? 'self-start' : ''}`}>
          {/* Replace this with your own logo */}
          <img 
            src="\src\assets\Perplexity-Logo.png" 
            alt="Your Logo" 
            width="150" 
            height="120"
            className="object-contain"
          />

        {/* New Thread Button */}
        <Link 
          to="/?new=true" 
          className={`flex items-center justify-center bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-6 transition-colors font-medium ${isExpanded ? 'w-full py-2 px-4' : 'w-12 h-12'}`}
        >
          <Plus size={isExpanded ? 20 : 24} />
          {isExpanded && <span className="ml-2 text-sm">New Thread</span>}
        </Link>

        {/* Navigation Items */}
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  title={!isExpanded ? item.label : ''}
                  className={`flex items-center p-3 my-1 rounded-lg text-sm transition-colors ${
                    pathname === item.to || (item.to === '/' && pathname === '/') 
                      ? 'bg-gray-200 font-semibold' 
                      : 'hover:bg-gray-200'
                  } ${!isExpanded ? 'justify-center' : ''}`}
                >
                  <item.icon className={`h-6 w-6 ${isExpanded ? 'mr-3' : ''}`} />
                  {isExpanded && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={`flex flex-col ${isExpanded ? 'items-start' : 'items-center'}`}>
        <div className="w-full border-t my-2"></div>
        
        {/* Account Section */}
        <div className={`flex items-center p-3 rounded-lg hover:bg-gray-200 w-full ${!isExpanded ? 'justify-center' : ''}`}>
          <div className={`w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm ${isExpanded ? 'mr-3' : ''}`}>
            A
          </div>
          {isExpanded && (
            <div className="flex-1 mr-2">
              <UserButton 
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-white"
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Upgrade Link */}
        <Link 
          to="/upgrade" 
          className={`flex items-center p-3 rounded-lg hover:bg-gray-200 w-full text-sm ${!isExpanded ? 'justify-center' : ''}`}
        >
          <ArrowUp className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
          {isExpanded && 'Upgrade'}
        </Link>

        {/* Install Link */}
        <Link 
          to="/install" 
          className={`flex items-center p-3 rounded-lg hover:bg-gray-200 w-full text-sm ${!isExpanded ? 'justify-center' : ''}`}
        >
          <Zap className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
          {isExpanded && 'Install'}
        </Link>

        <div className="w-full border-t my-2"></div>

        {/* Collapse/Expand Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className={`flex items-center p-3 rounded-lg hover:bg-gray-200 w-full text-sm ${!isExpanded ? 'justify-center' : ''}`}
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5 mr-3" /> : <ChevronRight className="h-5 w-5" />}
          {isExpanded && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}