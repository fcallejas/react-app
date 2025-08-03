import { Button, message } from 'antd';
import 'antd/dist/reset.css';

export default function TestMessage() {
  return (
    <div style={{ padding: 50 }}>
      <Button
        type="primary"
        onClick={() => message.error('Mensaje de error visible')}
      >
        Probar mensaje
      </Button>
    </div>
  );
}
