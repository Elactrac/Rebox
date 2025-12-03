import React, { useState } from 'react';
import { Users, Building2, Recycle } from 'lucide-react';

const RoleSelection = ({ onSelect, userName }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      value: 'INDIVIDUAL',
      title: 'Individual',
      icon: Users,
      description: 'Personal account for household recycling',
      color: 'green',
    },
    {
      value: 'BUSINESS',
      title: 'Business',
      icon: Building2,
      description: 'For businesses with packaging waste',
      color: 'blue',
    },
    {
      value: 'RECYCLER',
      title: 'Recycler',
      icon: Recycle,
      description: 'For recycling companies and facilities',
      color: 'purple',
    },
  ];

  const handleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome{userName ? `, ${userName}` : ''}! 🎉
          </h1>
          <p className="text-gray-600">
            Choose your account type to get started with ReBox
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            
            return (
              <button
                key={role.value}
                onClick={() => handleSelect(role.value)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  ${
                    isSelected
                      ? `border-${role.color}-500 bg-${role.color}-50 shadow-lg`
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-4
                    ${isSelected ? `bg-${role.color}-100` : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-8 h-8 ${isSelected ? `text-${role.color}-600` : 'text-gray-600'}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`
              px-8 py-3 rounded-lg font-semibold text-white
              transition-all duration-200
              ${
                selectedRole
                  ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
