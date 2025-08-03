// File: src/pages/Login.jsx

import { Form, Input, Button, Card, message, Select } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useIntl } from 'react-intl';

/**
 * Componente de inicio de sesión con selección de idioma.
 */
export default function Login({ onLanguageChange }) {
  const [form] = Form.useForm();
  const { loginAsync, isLoading } = useAuth();
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const intl = useIntl();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lang = params.get('lang') || 'es';
    onLanguageChange(lang);
    localStorage.setItem('lang', lang);
  }, [location.search, onLanguageChange]);

  const onFinish = async (values) => {
    try {
      // Enviar también el lenguaje actual desde localStorage
      const lang = localStorage.getItem('lang') || 'es';
      const data = await loginAsync({ ...values, lang });

      if (data.requires2FA) {
        setUserId(data.userId);
        message.info(intl.formatMessage({ id: 'login.otpRequired' }));
        navigate('/verify-otp', { state: { userId: data.userId } });
      } else {
        message.error(intl.formatMessage({ id: 'login.otpMissing' }));
      }
    } catch (err) {
      // Mostrar mensaje desde el backend si viene
      const backendMessage = err?.response?.data;
      if (backendMessage) {
        message.error(backendMessage);
      } else {
        message.error(intl.formatMessage({ id: 'login.invalidCredentials' }));
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card title={intl.formatMessage({ id: 'login.title' })} style={{ width: 340 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'login.username' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label={intl.formatMessage({ id: 'login.password' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Select
              defaultValue="es"
              onChange={(val) => {
                onLanguageChange(val);
                localStorage.setItem('lang', val);
              }}
              style={{ width: '100%' }}
            >
              <Select.Option value="es">Español</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              {intl.formatMessage({ id: 'login.button' })}
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <a onClick={() => navigate('/forgot-password')}>
                {intl.formatMessage({ id: 'login.forgotPassword' })}
              </a>
            </div>
          </Form.Item>  
        </Form>
      </Card>
    </div>
  );
}
