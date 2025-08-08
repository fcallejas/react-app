// HeaderResponsive.jsx
import React, { useState } from "react";
import { Grid, Button, Drawer, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
const { useBreakpoint } = Grid;

/**
 * Componente de header responsivo:
 * - Muestra botón hamburguesa SOLO en pantallas pequeñas (< md).
 * - En pantallas >= md muestra el menú horizontal normal.
 */
export default function HeaderResponsive({ items = [], onClickItem }) {
  /** Estado de apertura del Drawer (solo móvil) */
  const [open, setOpen] = useState(false);

  /** Breakpoints de Ant Design (xs, sm, md, lg, xl, xxl) */
  const screens = useBreakpoint();

  /** ¿Es escritorio? Verdadero cuando el ancho es al menos md */
  const isDesktop = !!screens.md;

  /** Cierra drawer y propaga click de item */
  const handleMenuClick = (info) => {
    setOpen(false);
    onClickItem?.(info);
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* Aquí tu logo o título */}
      <div style={{ fontWeight: 600, flex: 1 }}>Mi App</div>

      {/* Desktop: menú horizontal */}
      {isDesktop ? (
        <Menu
          mode="horizontal"
          items={items}
          onClick={handleMenuClick}
          style={{ borderBottom: "none" }}
        />
      ) : (
        /* Móvil: botón hamburguesa */
        <>
          <Button
            type="text"
            aria-label="Abrir menú"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
          />
          <Drawer
            placement="left"
            open={open}
            onClose={() => setOpen(false)}
            title="Menú"
            bodyStyle={{ padding: 0 }}
          >
            <Menu mode="inline" items={items} onClick={handleMenuClick} />
          </Drawer>
        </>
      )}
    </header>
  );
}
