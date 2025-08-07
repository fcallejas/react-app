-- =====================================================================================
-- Script:        Menu_DB_Schema.sql
-- Objetivo:      Crear la estructura de base de datos para manejo de menús dinámicos,
--                multidioma, jerárquicos, con control de permisos por usuario y rol.
-- Fecha:         2025-08-07
-- Autor:         Generado por ChatGPT para BPMCO
-- =====================================================================================

-- ==============================
-- Tabla de idiomas soportados
-- ==============================
CREATE TABLE Languages (
    Code NVARCHAR(5) PRIMARY KEY,  -- Código ISO, ej: 'es', 'en'
    Name NVARCHAR(100) NOT NULL    -- Nombre descriptivo: Español, English, etc.
);

-- ==============================
-- Tabla de menús (estructura jerárquica)
-- ==============================
CREATE TABLE Menus (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ParentId INT NULL,                            -- Soporta submenús (auto-relación)
    Icon NVARCHAR(100) NULL,                      -- Icono opcional para frontend
    Url NVARCHAR(500) NULL,                       -- Ruta interna o externa (validar en frontend)
    OpenInNewTab BIT NOT NULL DEFAULT 0,          -- Si debe abrir en nueva pestaña
    Position INT NOT NULL DEFAULT 0,              -- Posición personalizada para ordenamiento
    IsActive BIT NOT NULL DEFAULT 1,              -- Control de visibilidad lógica
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Menus_Parent FOREIGN KEY (ParentId) REFERENCES Menus(Id)
);

-- =====================================
-- Textos multidioma para cada menú
-- =====================================
CREATE TABLE MenuTranslations (
    MenuId INT NOT NULL,
    LangCode NVARCHAR(5) NOT NULL,                -- Código ISO del idioma
    Title NVARCHAR(200) NOT NULL,                 -- Título que se mostrará al usuario
    Tooltip NVARCHAR(300) NULL,                   -- Texto de ayuda opcional
    PRIMARY KEY (MenuId, LangCode),
    FOREIGN KEY (MenuId) REFERENCES Menus(Id),
    FOREIGN KEY (LangCode) REFERENCES Languages(Code)
);

-- =====================================	
-- Tabla de acciones disponibles (CRUD)
-- =====================================
CREATE TABLE Action (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,            -- Ej: view, create, edit, delete
    Description NVARCHAR(200) NOT NULL
);

-- =====================================
-- Permisos por ROL
-- =====================================
CREATE TABLE RoleMenuPermissions (
    RoleId INT NOT NULL,                          -- Asociado a tabla Roles
    MenuId INT NOT NULL,
    ActionId INT NOT NULL,                        -- create, view, edit, etc.
    PRIMARY KEY (RoleId, MenuId, ActionId),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    FOREIGN KEY (MenuId) REFERENCES Menus(Id),
    FOREIGN KEY (ActionId) REFERENCES Actions(Id)
);

-- =====================================
-- Permisos por USUARIO
-- =====================================
CREATE TABLE UserMenuPermissions (
    UserId INT NOT NULL,                          -- Asociado a tabla Users
    MenuId INT NOT NULL,
    ActionId INT NOT NULL,
    PRIMARY KEY (UserId, MenuId, ActionId),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (MenuId) REFERENCES Menus(Id),
    FOREIGN KEY (ActionId) REFERENCES Actions(Id)
);

-- =====================================
-- Auditoría de accesos a opciones del menú
-- =====================================
CREATE TABLE MenuAccessLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    MenuId INT NOT NULL,
    AccessTime DATETIME NOT NULL DEFAULT GETDATE(),
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(300) NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (MenuId) REFERENCES Menus(Id)
);

drop table MenuAccessLogs

-- =====================================
-- Tabla de auditoría de accesos y clics en el menú
-- =====================================
CREATE TABLE MenuAccessLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,                    -- Identificador único del log
    UserId INT NOT NULL,                                 -- Usuario que accedió
    MenuId INT NULL,                                     -- ID del menú (FK, si aplica)
    MenuCode NVARCHAR(100) NULL,                         -- Código opcional si no hay MenuId
    AccessTime DATETIME NOT NULL DEFAULT GETDATE(),      -- Fecha y hora del acceso
    IpAddress NVARCHAR(50) NULL,                         -- Dirección IP del cliente
    UserAgent NVARCHAR(300) NULL,                        -- Información del navegador o dispositivo
    ActionType NVARCHAR(50) NOT NULL DEFAULT 'click',    -- Tipo de acción: 'click', 'view', etc.
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (MenuId) REFERENCES Menus(Id)
);


-- Inserta idiomas comunes en la tabla Languages
INSERT INTO Languages (Code, Name) VALUES 
('es', 'Español'),
('en', 'Inglés'),
('fr', 'Francés'),
('de', 'Alemán'),
('pt', 'Portugués'),
('it', 'Italiano'),
('zh', 'Chino'),
('ja', 'Japonés'),
('ko', 'Coreano'),
('ru', 'Ruso');