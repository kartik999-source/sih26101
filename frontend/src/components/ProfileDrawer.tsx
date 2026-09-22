import React from 'react';
import { ProfessionalProfile } from './ProfessionalProfile';
import { StudentProfile, UserRole } from '../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  currentRole: UserRole;
  onSaveProfile: (updated: Partial<StudentProfile>) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  student,
  currentRole,
  onSaveProfile,
  onNavigateTab
}) => {
  return (
    <ProfessionalProfile
      isOpen={isOpen}
      onClose={onClose}
      student={student}
      currentRole={currentRole}
      onSaveProfile={onSaveProfile}
      onNavigateTab={onNavigateTab}
    />
  );
};
