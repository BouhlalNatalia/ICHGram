import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import styles from './EditProfile.module.css';
import type { IUser, UpdateProfileData } from '../../../../types/index';
import { getImageUrl } from '../../../../config'; 

interface EditProfileProps {
  currentUser: IUser;
  onSave: (data: UpdateProfileData) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ currentUser, onSave }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [about, setAbout] = useState(currentUser.bio || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  

  const [avatarPreview, setAvatarPreview] = useState<string>(
    getImageUrl(currentUser.avatar)
  );
  

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleLocalSave = () => {
    onSave({
      username,
      bio: about,
      website: website,
      file: selectedFile || undefined 
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit profile</h1>

      <div className={styles.photoSection}>
        <div className={styles.userInfo}>
          <img src={avatarPreview} alt="Avatar" className={styles.avatar} />
          <div className={styles.userText}>
            <span className={styles.usernameLabel}>{username}</span>
            <p className={styles.description}>Update profile photo</p>
          </div>
        </div>
        <label className={styles.newPhotoBtn}>
          New photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Website</label>
        <div className={styles.websiteWrapper}>
          <LinkIcon size={16} className={styles.linkIcon} />
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="bit.ly/your-link"
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>About</label>
        <textarea
          className={styles.textarea}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={150}
        />
        <div className={styles.charCounter}>{about.length} / 150</div>
      </div>

      <button className={styles.saveBtn} onClick={handleLocalSave} type="button">
        Save
      </button>
    </div>
  );
};

export default EditProfile;