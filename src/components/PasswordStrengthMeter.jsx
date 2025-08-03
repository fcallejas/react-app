import React, { useEffect, useState } from 'react';
import { Progress, Typography } from 'antd';
import { useIntl } from 'react-intl';
import rules from '../config/passwordRules.json';

const { Text } = Typography;

export default function PasswordStrengthMeter({ password }) {
  const [score, setScore] = useState(0);
  const intl = useIntl();

  useEffect(() => {
    let tempScore = 0;
    if (rules.minLength && password.length >= rules.minLength) tempScore++;
    if (rules.requireUppercase && /[A-Z]/.test(password)) tempScore++;
    if (rules.requireLowercase && /[a-z]/.test(password)) tempScore++;
    if (rules.requireNumber && /[0-9]/.test(password)) tempScore++;
    if (rules.requireSymbol && /[^A-Za-z0-9]/.test(password)) tempScore++;
    setScore(tempScore);
  }, [password]);

  const percentage = (score / 5) * 100;
  const color = percentage < 60 ? 'red' : percentage < 80 ? 'orange' : 'green';

  return (
    <div>
      <Progress percent={percentage} strokeColor={color} showInfo={false} />
      <ul style={{ paddingLeft: 20, fontSize: 12 }}>
        {rules.minLength && (
          <li>
            <Text type={password.length >= rules.minLength ? 'success' : 'danger'}>
              {intl.formatMessage({ id: 'password.minLength' }, { length: rules.minLength })}
            </Text>
          </li>
        )}
        {rules.requireUppercase && (
          <li>
            <Text type={/[A-Z]/.test(password) ? 'success' : 'danger'}>
              {intl.formatMessage({ id: 'password.uppercase' })}
            </Text>
          </li>
        )}
        {rules.requireLowercase && (
          <li>
            <Text type={/[a-z]/.test(password) ? 'success' : 'danger'}>
              {intl.formatMessage({ id: 'password.lowercase' })}
            </Text>
          </li>
        )}
        {rules.requireNumber && (
          <li>
            <Text type={/[0-9]/.test(password) ? 'success' : 'danger'}>
              {intl.formatMessage({ id: 'password.number' })}
            </Text>
          </li>
        )}
        {rules.requireSymbol && (
          <li>
            <Text type={/[^A-Za-z0-9]/.test(password) ? 'success' : 'danger'}>
              {intl.formatMessage({ id: 'password.symbol' })}
            </Text>
          </li>
        )}
      </ul>
    </div>
  );
}
