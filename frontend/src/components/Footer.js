import React from 'react';
import { Space } from 'antd';
import { useTheme } from 'next-themes';

export default function CustomFooter() {
  const { theme, setTheme } = useTheme('dark');

  const onChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <div className="footer">
      <div>
        <p>2022 © Selendra, Blockchain All right reserve</p>
        <Space>
          <Space className="preference" onClick={onChange}>
            <i className="ri-settings-4-line"></i>
            <span>Preference</span>
          </Space>
          {theme === 'light' ? (
            <i
              className="ri-sun-line dark-mode"
              onClick={() => setTheme('dark')}
            ></i>
          ) : (
            <i
              class="ri-moon-line dark-mode"
              onClick={() => setTheme('light')}
            ></i>
          )}
        </Space>
      </div>

      <div>
        <a href="https://www.selendra.com" target="_blank" rel="noreferrer">
          <p>Website</p>
        </a>
        <a href="https://docs.selendra.org" target="_blank" rel="noreferrer">
          <p>Docs</p>
        </a>
        <a href="https://github.com/selendra" target="_blank" rel="noreferrer">
          <p>GitHub</p>
        </a>
      </div>
    </div>
  );
}
