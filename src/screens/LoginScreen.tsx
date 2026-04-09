import React, { useState } from 'react';
import { setUser } from '../store';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { authAPI, setAuthToken } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'reset_email' | 'reset_code'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await authAPI.login(email.trim().toLowerCase(), password);
      setAuthToken(result.data.token);
      setUser(result.data.user);
      navigation.replace('MainApp');
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authAPI.sendResetCode(resetEmail);
      setStep('reset_code');
      Alert.alert('Code Sent', `A reset code has been sent to ${resetEmail}`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(resetEmail, resetCode, newPassword);
      Alert.alert('Success', 'Password reset successful! Please log in.');
      setStep('login');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset_email') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SOIN</Text>
        <Text style={styles.subtitle}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={resetEmail}
          onChangeText={setResetEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleSendResetCode} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep('login')}>
          <Text style={styles.link}>← Back to login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'reset_code') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SOIN</Text>
        <Text style={styles.subtitle}>Enter Reset Code</Text>
        <Text style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>
          We sent a code to {resetEmail}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          value={resetCode}
          onChangeText={setResetCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep('reset_email')}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOIN</Text>
      <Text style={styles.subtitle}>Welcome back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep('reset_email')} style={{ marginBottom: 12 }}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#6C63FF' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#888', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#6C63FF', fontSize: 14, marginBottom: 8 },
});