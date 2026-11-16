import { useState } from 'react';
import styles from '../ChatWindow/ChatWindow.module.css';

interface Props {
  onSend: (text: string) => void;
}

const MessageInput: React.FC<Props> = ({ onSend }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  return (
    <div className={styles.inputWrapper}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Write message..."
        className={styles.input}
      />

      {value.trim() && (
        <button onClick={handleSend} className={styles.sendBtn}>
          Send
        </button>
      )}
    </div>
  );
};

export default MessageInput;