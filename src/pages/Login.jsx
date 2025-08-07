// File: src/pages/Login.jsx
import { Form, Input, Button, Card, message, Select,Alert  } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { useIntl } from 'react-intl';
import useRecaptcha from '../hooks/useRecaptcha';

export default function Login({ onLanguageChange }) {
  const [form] = Form.useForm();
  const { loginAsync, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();
  const [remaining, setRemaining] = useState(0);
  const usernameRef = useRef(null); // Referencia al input de username


  const [lang, setLang] = useState(() => (localStorage.getItem('lang') || 'es').toLowerCase());

  // Sincroniza con ?lang de la URL y con localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlLang = params.get('lang');
    const effective = (urlLang || localStorage.getItem('lang') || 'es').toLowerCase();

    if (effective !== lang) {
      setLang(effective);
      localStorage.setItem('lang', effective);
      onLanguageChange?.(effective);
    }

    if (remaining > 0) {
    const timer = setInterval(() => {
      setRemaining(prev => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          clearInterval(timer);

          // 🧼 Limpiar campo de contraseña y enfocar usuario
          setTimeout(() => {
            form.resetFields(['password']);
            usernameRef.current?.focus();
          }, 100);

          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search,remaining]);

  const updateUrlLang = (newLang) => {
    const params = new URLSearchParams(location.search);
    params.set('lang', newLang);
    navigate(
      { pathname: '/login', search: params.toString() },
      { replace: true }
    );
  };

  const handleLangChange = (val) => {
    const next = val.toLowerCase();
    setLang(next);
    localStorage.setItem('lang', next);
    onLanguageChange?.(next);
    updateUrlLang(next); // ⬅️ Actualiza el parámetro en la URL
  };
  
  //Para el uso de reCaptcha
  const { isReady: captchaReady, execute } = useRecaptcha();

  const onFinish = async (values) => {
    try {
      // Obtener token de reCAPTCHA v3 para la acción "login"
      const recaptchaToken = captchaReady ? await execute('login') : null;

      const data = await loginAsync({ ...values, lang,recaptchaToken });
      if (data.requires2FA) {
        message.info(intl.formatMessage({ id: 'login.otpRequired' }));
        navigate('/verify-otp', { state: { userId: data.userId } });
      } else {
        message.error(intl.formatMessage({ id: 'login.otpMissing' }));
      }
    } catch (err) {

      if (err?.response?.status === 423 && data?.remainingSeconds) {
        setRemaining(data.remainingSeconds);
      }

      const backendMessage = err?.response?.data?.message;
      message.error(backendMessage || intl.formatMessage({ id: 'login.invalidCredentials' }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card title={intl.formatMessage({ id: 'login.title' })} style={{ width: 340 }}>
        {remaining > 0 && (
          <Alert
            type="warning"
            showIcon
            message={intl.formatMessage({ id: 'login.locked' })}
            description={`${intl.formatMessage({ id: 'login.retryIn' })} ${remaining}s`}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'login.username' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input  ref={usernameRef}/>
          </Form.Item>

          <Form.Item
            name="password"
            label={intl.formatMessage({ id: 'login.password' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            {/* Select CONTROLADO + sincroniza URL */}
            <Select
              value={lang}
              onChange={handleLangChange}
              style={{ width: '100%' }}
              options={[
                { value: 'es', label: 'Español' },
                { value: 'en', label: 'English' }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              {intl.formatMessage({ id: 'login.button' })}
            </Button>
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <a onClick={() => navigate(`/forgot-password?lang=${lang}`)}>
                {intl.formatMessage({ id: 'login.forgotPassword' })}
              </a>
            </div>
          </Form.Item>    

        </Form>
      </Card>
    </div>
  );
}
