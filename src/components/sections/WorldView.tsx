import React from 'react';
import Map3D from '../Map3D';

export const WorldView: React.FC = () => {
  return (
    <div className="p-6 h-full w-full flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">World View</h1>
      <Map3D />
    </div>
  );
};