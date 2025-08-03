// File: src/pages/ResetPassword.jsx

import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useIntl } from 'react-intl';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const intl = useIntl();
  const lang = localStorage.getItem('lang') || 'es';
  const [password, setPassword] = useState('');   // ← estado para el medidor

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: values.newPassword,
        lang,
      });

      message.success(response.data.message || intl.formatMessage({ id: 'reset.success' }));
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        details.forEach((msg) => message.error(msg));
      } else {
        message.error(err.response?.data || intl.formatMessage({ id: 'reset.error' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={intl.formatMessage({ id: 'reset.title' })} style={{ maxWidth: 400, margin: 'auto', marginTop: 60 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="newPassword"
          label={intl.formatMessage({ id: 'reset.newPassword' })}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'reset.required' }) },
            { min: 6, message: intl.formatMessage({ id: 'reset.minLength' }) }
          ]}
        >
          <Input.Password  onChange={e => setPassword(e.target.value)}/>
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={intl.formatMessage({ id: 'reset.confirmPassword' })}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'reset.confirmRequired' }) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(intl.formatMessage({ id: 'reset.noMatch' })));
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {intl.formatMessage({ id: 'reset.button' })}
          </Button>
        </Form.Item>

        <PasswordStrengthMeter password={password} />
      </Form>
    </Card>
  );
};

export default ResetPassword;