// File: src/pages/VerifyOtp.jsx

import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useIntl } from 'react-intl';

/**
 * Componente para ingresar el código OTP (2FA).
 */
export default function VerifyOtp() {
  const [form] = Form.useForm();
  const { verify2FAAsync, isVerifying } = useAuth(); // Usamos mutateAsync
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  const userId = location.state?.userId;

  const onFinish = async (values) => {
    const lang = localStorage.getItem('lang') || 'es';

    try {
      await verify2FAAsync({ userId, code: values.otp, lang });
      message.success(intl.formatMessage({ id: 'otp.success' }));
      navigate('/');
    } catch (error) {
      const msg = error?.response?.data?.message || intl.formatMessage({ id: 'otp.invalid' });
      message.error(msg);
    }
  };

  if (!userId) {
    message.error(intl.formatMessage({ id: 'otp.invalidSession' }));
    navigate('/login');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card title={intl.formatMessage({ id: 'otp.title' })} style={{ width: 340 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="otp"
            label={intl.formatMessage({ id: 'otp.label' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) }]}
          >
            <Input.OTP length={6} inputType="numeric" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isVerifying} block>
              {intl.formatMessage({ id: 'otp.verify' })}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
