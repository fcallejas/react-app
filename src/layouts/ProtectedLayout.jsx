// src/layouts/ProtectedLayout.jsx
// ------------------------------------------------------------
// Layout protegido con menú responsive usando Ant Design + control de sesión inactiva.
// Ajustado para que el menú horizontal ocupe el espacio y no colapse en un solo ítem.
// - Muestra hamburguesa (Drawer + Menu) en pantallas < md.
// - Muestra menú horizontal en pantallas >= md con estilo expandido.
// - Incluye <Outlet /> para renderizar rutas hijas.
// - Integra useIdleSession para cierre de sesión por inactividad/expiración.
// - Obtiene opciones de menú desde el hook useMenu conectado a la API.
// ------------------------------------------------------------

import React from "react";
import { Layout, Grid, Button, Drawer, Menu, Space, Typography, Avatar, Spin } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useIdleSession from "../hooks/useIdleSession.jsx";
import { useMenu } from "../hooks/useMenu.js";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { Title } = Typography;

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [open, setOpen] = React.useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const lang = localStorage.getItem("lang") || "es";

  // Llamada a la API para obtener el menú según userId e idioma
  const { data: menuData, isLoading } = useMenu(user.id, lang);
  /*
  const items = React.useMemo(() => {
    return (menuData || []).map((it) => ({
      key: it.key || it.path || it.id,
      label: it.label || it.text || "Sin título",
    }
    ))}, [menuData]);*/


    // 2) Normalizar filas planas y construir árbol children por ParentId
  const normalizeMenuItems = React.useCallback((data) => {
    if (!Array.isArray(data)) return [];

    // Paso 1: normalizar nodos base
    const nodes = data.map((row) => {
      const id = row.key;
      const parentId = row.parent ?? null;

      // Label: usa Title si viene directo; si viene como traducciones, tomar por LangCode
      let label =
        row.label;

      // Key: prioriza Path (bueno para selectedKeys); fallback Code; último Id
      const key = String(row.key);

      return { id, parentId, key, label, children: [], raw: row };
    });

    // Paso 2: armar árbol
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const roots = [];
    for (const n of nodes) {
      if (n.parentId && byId.has(n.parentId)) {
        byId.get(n.parentId).children.push(n);
      } else {
        roots.push(n);
      }
    }

    // Paso 3: limpiar helpers
    const strip = (n) => ({
      key: n.key,
      label: n.label,
      children: n.children.length ? n.children.map(strip) : undefined,
      raw: n.raw,
    });

    return roots.map(strip);
  }, []);

  const items = React.useMemo(
    () => {
      const tempItems=(menuData || []).map((it) => ({
      key: it.key || it.path || it.id,
      label: it.label || it.text || "Sin título",
      parent: it.parent  
    }));
      const res=normalizeMenuItems(tempItems || []);
      //console.log('Items',res);
      return res},
    [menuData]
  );

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

  const selectedKeys =[];/* React.useMemo(() => {
    const match = items.find((it) => it.key);
    return match ? [match.label] : [];
  }, [items, location.pathname]);*/

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
            {isLoading ? (
              <Spin />
            ) : (
              <Menu
                mode="horizontal"
                items={items}
                selectedKeys={selectedKeys}
                onClick={onMenuClick}
                style={{ lineHeight: "64px", borderBottom: "none" }}
              />
            )}
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
        
      >
        {isLoading ? (
          <Spin style={{ margin: 16 }} />
        ) : (
          <Menu
            mode="inline"
            items={items}
            selectedKeys={selectedKeys}
            onClick={onMenuClick}
            style={{ borderRight: 0 }}
          />
        )}
      </Drawer>

      <Content style={{ padding: 16 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
