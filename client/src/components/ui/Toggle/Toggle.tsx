import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; 
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className={styles.toggleWrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <label className={styles.switch}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};

export default Toggle;