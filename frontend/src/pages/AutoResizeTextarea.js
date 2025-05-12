import React, { useRef, useEffect } from 'react';

const AutoResizeTextarea = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onInput={e => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
      style={{
        overflow: 'hidden',
        resize: 'none',
        minHeight: '80px',
        fontFamily: 'inherit',
        fontSize: '1rem',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
  );
};

export default AutoResizeTextarea;
