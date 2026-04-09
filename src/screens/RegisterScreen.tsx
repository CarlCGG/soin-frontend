import React, { useState } from 'react';
import { setUser } from '../store';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { authAPI, setAuthToken } from '../services/api';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  

  const handleSendCode = async () => {
      if (!email || !username || !password || !confirmPassword) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }
  if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return;
  }
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    Alert.alert('Weak Password', errors.join('\n'));
    return;
  }
    setLoading(true);
    try {
      await authAPI.sendCode(email, username, password);
      setStep('verify');
      Alert.alert('Code Sent', `A verification code has been sent to ${email}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'This email or username is already taken';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(email, code);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      navigation.replace('MainApp');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Invalid or expired code';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOIN</Text>
      <Text style={styles.subtitle}>
        {step === 'form' ? 'Create an account' : 'Enter verification code'}
      </Text>

      {step === 'form' ? (
        <>
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
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {password.length > 0 && (() => {
            const { level, color } = getPasswordStrength(password);
            const width = level === 'weak' ? '33%' : level === 'medium' ? '66%' : '100%';
            return (
              <View style={{ marginBottom: 12, marginTop: -8 }}>
                <View style={{ height: 4, backgroundColor: '#eee', borderRadius: 4, marginBottom: 4 }}>
                  <View style={{ height: 4, width, backgroundColor: color, borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 12, color, fontWeight: '600' }}>
                  {level === 'weak' ? ' Weak' : level === 'medium' ? ' Medium' : ' Strong'}
                </Text>
              </View>
            );
          })()}
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Verification Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>
            We sent a code to {email}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Sign Up</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('form')} style={{ marginBottom: 12 }}>
            <Text style={styles.link}>← Go back</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
  link: { textAlign: 'center', color: '#6C63FF', fontSize: 14 },
});