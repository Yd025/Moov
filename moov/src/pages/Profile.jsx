import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// TODO: Import Firebase functions
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';

/**
 * Profile Page - Display and edit user profile information
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    mobilityAid: '',
    constraint: '',
    ageFactor: 'standard',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      // TODO: Load user profile from Firestore
      // const userDoc = await getDoc(doc(db, 'users', user.uid));
      // const profile = userDoc.data();
      
      // Mock: Load from localStorage
      const storedProfile = localStorage.getItem('moov_userProfile');
      const profile = storedProfile 
        ? JSON.parse(storedProfile)
        : null;
      
      setUserProfile(profile);
      if (profile) {
        setEditedProfile({
          mobilityAid: profile.mobilityAid || '',
          constraint: profile.constraint || '',
          ageFactor: profile.ageFactor || 'standard',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setEditedProfile({
        mobilityAid: userProfile.mobilityAid || '',
        constraint: userProfile.constraint || '',
        ageFactor: userProfile.ageFactor || 'standard',
      });
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Save to Firestore
      // await setDoc(doc(db, 'users', user.uid), {
      //   ...editedProfile,
      //   mobility: editedProfile.mobilityAid === 'wheelchair' ? 'wheelchair' : 'mobile',
      //   updatedAt: new Date(),
      // });

      // Mock: Save to localStorage
      const profileToSave = {
        ...editedProfile,
        mobility: editedProfile.mobilityAid === 'wheelchair' ? 'wheelchair' : 'mobile',
        createdAt: userProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('moov_userProfile', JSON.stringify(profileToSave));
      
      setUserProfile(profileToSave);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getMobilityAidLabel = (value) => {
    const labels = {
      none: 'None',
      wheelchair: 'Wheelchair',
      walker: 'Walker',
      cane: 'Cane',
    };
    return labels[value] || value;
  };

  const getConstraintLabel = (value) => {
    const labels = {
      upper_body: 'Upper Body',
      lower_body: 'Lower Body',
      hands_grip: 'Hands/Grip',
      full_body: 'Full Body',
    };
    return labels[value] || value;
  };

  const getAgeFactorLabel = (value) => {
    const labels = {
      standard: 'Standard Mode',
      senior: 'Senior Mode',
    };
    return labels[value] || value;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#33E1ED]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#33E1ED]">Profile</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Account Information */}
        <section className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#33E1ED]">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg">{user?.email || 'Not available'}</p>
            </div>
            {user?.displayName && (
              <div>
                <p className="text-sm text-gray-400">Display Name</p>
                <p className="text-lg">{user.displayName}</p>
              </div>
            )}
          </div>
        </section>

        {/* Profile Information */}
        <section className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#33E1ED]">Profile Settings</h2>
            {!isEditing && userProfile && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-[#33E1ED] text-[#121212] font-semibold rounded-lg hover:bg-[#2AC5D0] transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {!userProfile ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No profile found. Complete onboarding to set up your profile.</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-6 py-3 bg-[#33E1ED] text-[#121212] font-semibold rounded-lg hover:bg-[#2AC5D0] transition-colors"
              >
                Complete Onboarding
              </button>
            </div>
          ) : isEditing ? (
            <div className="space-y-6">
              {/* Mobility Aid */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobility Aid
                </label>
                <select
                  value={editedProfile.mobilityAid}
                  onChange={(e) => setEditedProfile({ ...editedProfile, mobilityAid: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="wheelchair">Wheelchair</option>
                  <option value="walker">Walker</option>
                  <option value="cane">Cane</option>
                </select>
              </div>

              {/* Constraint */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Focus Area
                </label>
                <select
                  value={editedProfile.constraint}
                  onChange={(e) => setEditedProfile({ ...editedProfile, constraint: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:border-transparent"
                >
                  <option value="upper_body">Upper Body</option>
                  <option value="lower_body">Lower Body</option>
                  <option value="hands_grip">Hands/Grip</option>
                  <option value="full_body">Full Body</option>
                </select>
              </div>

              {/* Age Factor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode
                </label>
                <select
                  value={editedProfile.ageFactor}
                  onChange={(e) => setEditedProfile({ ...editedProfile, ageFactor: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:border-transparent"
                >
                  <option value="standard">Standard Mode</option>
                  <option value="senior">Senior Mode</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-[#33E1ED] text-[#121212] font-semibold rounded-lg hover:bg-[#2AC5D0] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Mobility Aid</p>
                <p className="text-lg">{getMobilityAidLabel(userProfile.mobilityAid)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Focus Area</p>
                <p className="text-lg">{getConstraintLabel(userProfile.constraint)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mode</p>
                <p className="text-lg">{getAgeFactorLabel(userProfile.ageFactor)}</p>
              </div>
            </div>
          )}
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

