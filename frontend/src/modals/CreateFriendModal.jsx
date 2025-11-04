import React, { useState } from 'react';
import BaseModal from './BaseModal';

const CreateFriendModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [systemMessage, setSystemMessage] = useState('');

  const handleSubmit = () => {
    onCreate({ name, system_message: systemMessage });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create a New Friend">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Friend's Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Short Description (System Message)"
          value={systemMessage}
          onChange={(e) => setSystemMessage(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded">
          Create
        </button>
      </div>
    </BaseModal>
  );
};

export default CreateFriendModal;
