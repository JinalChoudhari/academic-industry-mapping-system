import { Link, useLocation } from 'react-router';
import { Button } from './ui/button';
import { GraduationCap, Settings, Search, BookOpen, Factory, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Navigation() {
  const location = useLocation();
  
  const isUserPanelActive = ['/user', '/curriculum', '/shops-stations'].includes(location.pathname);

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-lg">Academic–Industry Mapping System</h2>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isUserPanelActive ? 'default' : 'outline'}>
                  <Search className="w-4 h-4 mr-2" />
                  User Panel
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/user" className="cursor-pointer">
                    <Search className="w-4 h-4 mr-2" />
                    Search & Correlate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/curriculum" className="cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Curriculum
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shops-stations" className="cursor-pointer">
                    <Factory className="w-4 h-4 mr-2" />
                    Shops & Stations
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/admin">
              <Button 
                variant={location.pathname === '/admin' ? 'default' : 'outline'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}