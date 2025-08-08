// src/layouts/ProtectedLayout.jsx
// ------------------------------------------------------------
// Layout protegido con menú responsive usando Ant Design + control de sesión inactiva.
// Ajustado para que el menú horizontal ocupe el espacio y no colapse en un solo ítem.
// - Muestra hamburguesa (Drawer + Menu) en pantallas < md.
// - Muestra menú horizontal en pantallas >= md con estilo expandido.
// - Incluye <Outlet /> para renderizar rutas hijas.
// - Integra useIdleSession para cierre de sesión por inactividad/expiración.
// ------------------------------------------------------------

import React from "react";
import { Layout, Grid, Button, Drawer, Menu, Space, Typography, Avatar } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useIdleSession from "../hooks/useIdleSession.jsx";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { Title } = Typography;

function useAppMenuItems() {
  // TODO: reemplazar por tu hook real (ej: useMenu(userId, lang))
  return React.useMemo(
    () => [
      { key: "/dashboard", label: "Dashboard" },
    ],
    []
  );
}

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [open, setOpen] = React.useState(false);
  const items = useAppMenuItems();

  // Hook de control de sesión inactiva/expirada
  const { WarningModal } = useIdleSession({
    minutes: Number(import.meta.env.VITE_SESSION_INACTIVITY_MINUTES || 15),
    warningSeconds: Number(import.meta.env.VITE_SESSION_WARNING_SECONDS || 60),
    expBufferSeconds: Number(import.meta.env.VITE_JWT_EXP_BUFFER_SECONDS || 60),
    onLogout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const lang = localStorage.getItem("lang") || "es";
      navigate(`/login?lang=${lang}`, { replace: true });
    },
    enabled: !!localStorage.getItem("token"),
  });

  const onMenuClick = (info) => {
    navigate(info.key);
    setOpen(false);
  };

  const selectedKeys = React.useMemo(() => {
    const match = items.find((it) => location.pathname.startsWith(it.key));
    return match ? [match.key] : [];
  }, [items, location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {WarningModal}

      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 16,
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Space align="center">
          {!screens.md && (
            <Button
              type="text"
              aria-label="Abrir menú"
              icon={<MenuOutlined />}
              onClick={() => setOpen(true)}
            />
          )}
          <Title level={4} style={{ margin: 0 }}>
            Panel
          </Title>
        </Space>

        {screens.md && (
          <div style={{ flex: 1, marginLeft: 24 }}>
            <Menu
              mode="horizontal"
              items={items}
              selectedKeys={selectedKeys}
              onClick={onMenuClick}
              style={{ lineHeight: "64px", borderBottom: "none" }}
            />
          </div>
        )}

        <Space>
          <Avatar icon={<UserOutlined />} />
        </Space>
      </Header>

      <Drawer
        title="Menú"
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onClick={onMenuClick}
          style={{ borderRight: 0 }}
        />
      </Drawer>

      <Content style={{ padding: 16 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
