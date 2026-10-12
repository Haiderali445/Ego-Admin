import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Modal, message } from 'antd';
import { Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login, verify2FA, step2FA, isFullyAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [twoFactorForm] = Form.useForm();

  const redirectPath = location.state?.from?.pathname || '/';

  if (isFullyAuthenticated) {
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handlePasswordLogin = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      form.resetFields(['password']);
      message.success('Password verified. Enter your 2FA administrator PIN.');
    } catch (err) {
      message.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (values) => {
    setLoading(true);
    try {
      const isValid = verify2FA(values.pin);
      if (isValid) {
        message.success('Security clearance granted. Redirecting...');
        navigate(redirectPath, { replace: true });
      } else {
        message.error('Invalid 2FA PIN code');
      }
    } catch (err) {
      twoFactorForm.resetFields();
      message.error(err.message || '2FA verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
            {step2FA ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-base font-bold text-foreground uppercase tracking-wider">
            Ego Studio Root Gate
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Sign in with your master credentials</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handlePasswordLogin}>
          <Form.Item
            name="email"
            label="Master Email"
            rules={[{ required: true, message: 'Email is required', type: 'email' }]}
          >
            <Input placeholder="admin@..." autoFocus autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Master Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full mt-2" loading={loading}>
            Authenticate
          </Button>
        </Form>
      </div>

      <Modal
        open={step2FA}
        title={null}
        footer={null}
        closable={false}
        maskClosable={false}
        keyboard={false}
        centered
        width={380}
      >
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Two-Factor Authentication</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your six-digit administrator PIN
          </p>
        </div>
        <Form form={twoFactorForm} layout="vertical" onFinish={handle2FASubmit}>
          <Form.Item
            name="pin"
            label="6-Digit PIN Code"
            rules={[
              { required: true, message: 'PIN code is required' },
              { len: 6, message: 'Enter all 6 digits' },
            ]}
          >
            <Input.OTP
              length={6}
              autoFocus
              autoComplete="off"
              formatter={(value) => value.replace(/\D/g, '')}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full mt-2" loading={loading}>
            Confirm PIN & Enter
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
