import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from '../../hook/storeHooks';
import { setCredentials } from '../../features/auth';
import api from '../../services/api';
import {
    EditProfile,
    PrivacySettings,
    NotificationSettings,
} from '../../features/profile';
import { ChangePasswordForm } from '../../features/auth';
import styles from './SettingsPage.module.css';

import type { IUser, UpdateProfileData } from '../../types/index';


interface SettingsPageProps {
    user: IUser;
    setUser?: (user: IUser | null) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, setUser }) => {
    const [activeTab, setActiveTab] = useState('edit-profile');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();



    const handleSave = async (updatedData: UpdateProfileData) => {
        try {
            const formData = new FormData();

            formData.append('username', updatedData.username || '');
            formData.append('fullName', updatedData.fullName || '');
            formData.append('bio', updatedData.bio || '');
            formData.append('website', updatedData.website || '');

            if (updatedData.file) {
                formData.append('avatar', updatedData.file);
            }


            const { data: updatedUser } = await api.put<IUser>(`/users/update`, formData);

       
            dispatch(setCredentials({
                user: updatedUser,
                token: localStorage.getItem('token') || ''
            }));

        
            localStorage.setItem('user', JSON.stringify(updatedUser));

            
            if (setUser) setUser(updatedUser);

            
            navigate(`/profile/${updatedUser.username}`);

        } catch (error: unknown) {
            console.error('Update failed:', error);
            let errorMessage = 'Error updating profile';

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }

            alert(errorMessage);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'edit-profile':
                return <EditProfile currentUser={user} onSave={handleSave} />;
            case 'password':
                return <ChangePasswordForm />;
            case 'notifications':
                return <NotificationSettings />;
            case 'privacy':
                return <PrivacySettings />;
            default:
                return <EditProfile currentUser={user} onSave={handleSave} />;
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <aside className={styles.settingsMenu}>
                <h2 className={styles.menuTitle}>Settings</h2>
                <ul className={styles.menuList}>
                    <li className={`${styles.menuItem} ${activeTab === 'edit-profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('edit-profile')}>
                        Edit Profile
                    </li>
                    <li className={`${styles.menuItem} ${activeTab === 'password' ? styles.active : ''}`}
                        onClick={() => setActiveTab('password')}>
                        Change Password
                    </li>
                    <li className={`${styles.menuItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('notifications')}>
                        Notifications
                    </li>
                    <li className={`${styles.menuItem} ${activeTab === 'privacy' ? styles.active : ''}`}
                        onClick={() => setActiveTab('privacy')}>
                        Privacy and security
                    </li>
                </ul>
            </aside>

            <section className={styles.settingsContent}>
                {renderContent()}
            </section>
        </div>
    );
};

export default SettingsPage;