// File: src/pages/ForgotPassword.jsx

import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import api from '../api/axios'; // Asegúrate que tienes esto configurado

/**
 * Componente para solicitar recuperación de contraseña.
 */
export default function ForgotPassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const intl = useIntl();

  const onFinish = async (values) => {
    const lang = localStorage.getItem('lang') || 'es';

    try {
      await api.post('/auth/request-password-reset', {
        userOrEmail: values.userOrEmail,
        lang,
      });

      message.success(intl.formatMessage({ id: 'forgot.success' }));
      navigate(`/login?lang=${lang}`, { replace: true });
    } catch (error) {
      message.error(intl.formatMessage({ id: 'forgot.fail' }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card title={intl.formatMessage({ id: 'forgot.title' })} style={{ width: 340 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="userOrEmail"
            label={intl.formatMessage({ id: 'forgot.label' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {intl.formatMessage({ id: 'forgot.send' })}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
