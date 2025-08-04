// File: src/pages/VerifyOtp.jsx
import {useEffect} from 'react'
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useIntl } from 'react-intl';
import appConfig from '../config/appConfig.json'; // ⬅️ import del JSON


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

   // Lee longitud desde env o config.json, con fallback a 6
  const OTP_LENGTH = Number(
    import.meta.env.VITE_OTP_LENGTH ?? appConfig?.otp?.length ?? 6
  );

   useEffect(() => {
    if (!userId) {
      message.error(intl.formatMessage({ id: 'otp.invalidSession' }));
      navigate('/login');
    }
  }, [userId, navigate, intl]);

  const onFinish = async (values) => {
    const lang = localStorage.getItem('lang') || 'es';

    try {
      await verify2FAAsync({ userId, code: values.otp, lang });
      message.success(intl.formatMessage({ id: 'otp.success' }));
      navigate('/dashboard');
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
            rules={[{ required: true, message: intl.formatMessage({ id: 'form.required' }) },
                  // Regla para exactamente OTP_LENGTH dígitos
              {
                pattern: new RegExp(`^\\d{${OTP_LENGTH}}$`),
                message: intl.formatMessage({ id: 'otp.invalidLength' }, { len: OTP_LENGTH }),
              },
            ]}
          >
            <Input.OTP length={OTP_LENGTH} inputType="numeric" />
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
