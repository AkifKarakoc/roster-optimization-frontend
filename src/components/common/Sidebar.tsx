import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Departments', path: '/departments', icon: BuildingOfficeIcon },
  { name: 'Qualifications', path: '/qualifications', icon: AcademicCapIcon },
  { name: 'Working Periods', path: '/working-periods', icon: ClockIcon },
  { name: 'Shifts', path: '/shifts', icon: CalendarDaysIcon },
  { name: 'Squad Patterns', path: '/squad-working-patterns', icon: ListBulletIcon },
  { name: 'Squads', path: '/squads', icon: UserGroupIcon },
  { name: 'Staff', path: '/staff', icon: UserGroupIcon },
  { name: 'Tasks', path: '/tasks', icon: ListBulletIcon },
  { name: 'Day Off Rules', path: '/day-off-rules', icon: CalendarDaysIcon },
  { name: 'Roster Planning', path: '/roster', icon: CalendarDaysIcon },
  { name: 'Constraints', path: '/constraints', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-lg font-bold text-white">Roster Optimizer</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 mb-1 text-sm font-medium rounded-lg transition-colors hover:bg-gray-700 ${
                isActive ? 'bg-gray-700 text-white border-r-2 border-blue-500' : 'text-gray-300'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;