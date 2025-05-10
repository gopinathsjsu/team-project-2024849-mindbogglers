import React from 'react';

// Component to visually display which password requirements are met
const PasswordRequirements = ({ password = '' }) => {
  // Default password to empty string to avoid errors if undefined

  // Inline styles for the container and list items
  const styles = {
    container: {
      marginTop: '10px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9'
    },
    list: {
      margin: '5px 0',
      paddingLeft: '20px'
    },
    item: {
      margin: '3px 0',
      color: '#888' // Gray for unmet criteria
    },
    metItem: {
      margin: '3px 0',
      color: 'green' // Green for met criteria
    }
  };

  // Boolean flags for each requirement
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return (
    <div style={styles.container}>
      <p>Password must contain:</p>
      <ul style={styles.list}>
        {/* Conditionally style each requirement based on whether it is met */}
        <li style={hasMinLength ? styles.metItem : styles.item}>
          At least 8 characters
        </li>
        <li style={hasUppercase ? styles.metItem : styles.item}>
          At least one uppercase letter
        </li>
        <li style={hasLowercase ? styles.metItem : styles.item}>
          At least one lowercase letter
        </li>
        <li style={hasNumber ? styles.metItem : styles.item}>
          At least one number
        </li>
        <li style={hasSpecial ? styles.metItem : styles.item}>
          At least one special character (!@#$%^&*()-_=+[]{{}}|;:,.<>/?)
        </li>
      </ul>
    </div>
  );
};

export default PasswordRequirements;
