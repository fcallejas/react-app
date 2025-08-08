// File: src/components/AppMenu.jsx
import { Menu, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useMenu } from '../hooks/useMenu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppMenu({ userId, lang }) {
  const { data = [], isLoading } = useMenu(userId, lang);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenu = (items) =>
    items.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon ? <i className={`anticon ${item.icon}`} /> : null,
      onClick: () => handleClick(item),
      children: item.children?.length ? renderMenu(item.children) : undefined
    }));

  return (
    <>
     
    </>
  );
}
