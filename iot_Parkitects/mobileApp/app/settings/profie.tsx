//(Withfra.me, 2022)
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Alert,
  TextInput,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import { verifyBeforeUpdateEmail, EmailAuthProvider,
  reauthenticateWithCredential, updatePassword,} from 'firebase/auth';

export default function AccountScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userNumber, setUserNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
const [confirmNewPassword, setConfirmNewPassword] = useState('');
const [showPasswordChange, setShowPasswordChange] = useState(false);

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Gets the logged-in user's profile from the .NET backend
      const apiUrl =
        `${process.env.EXPO_PUBLIC_API_URL}/api/User/profile/${currentUser.uid}`;

      const response = await fetch(apiUrl);

      const responseText = await response.text();

      console.log('Profile API status:', response.status);
      console.log('Profile API response:', responseText);

      if (!response.ok) {
        throw new Error(
          `Profile request failed: ${response.status} ${responseText}`
        );
      }

      const data = JSON.parse(responseText);

      setUserName(data.name || 'User');
      setUserEmail(data.email || currentUser.email || '');
      setUserNumber(data.userNumber || '');
    } catch (error) {
      console.error('Profile loading error:', error);

      Alert.alert(
        'Profile Error',
        'Unable to load your profile information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingName = () => {
    setEditedName(userName);
    setIsEditingName(true);
  };

  const startEditingEmail = () => {
    setEditedEmail(userEmail);
    setIsEditingEmail(true);
  };

  const cancelNameEdit = () => {
    setEditedName('');
    setIsEditingName(false);
  };

  const cancelEmailEdit = () => {
    setEditedEmail('');
    setIsEditingEmail(false);
  };

  const saveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Invalid Name', 'Please enter your name.');
      return;
    }

    await updateProfile(editedName.trim(), userEmail);
  };

  const saveEmail = () => {
  const newEmail = editedEmail.trim().toLowerCase();

  if (!newEmail) {
    Alert.alert(
      'Invalid Email',
      'Please enter your email address.'
    );
    return;
  }

  // Basic email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(newEmail)) {
    Alert.alert(
      'Invalid Email',
      'Please enter a valid email address.'
    );
    return;
  }

  if (newEmail === userEmail.toLowerCase()) {
    setIsEditingEmail(false);
    return;
  }

  // Store the cleaned email before showing the password prompt
  setEditedEmail(newEmail);
  setCurrentPassword('');
  setShowPasswordPrompt(true);
};

const confirmEmailChange = async () => {
  if (!currentPassword.trim()) {
    Alert.alert(
      'Password Required',
      'Please enter your current password.'
    );
    return;
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert('Error', 'You are not currently signed in.');
    return;
  }

  const newEmail = editedEmail.trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(newEmail)) {
    Alert.alert(
      'Invalid Email',
      'Please enter a valid email address.'
    );
    return;
  }

  setIsSaving(true);

  try {
    // Creates Firebase credentials using the current email
    // and the user's current password.
    const credential = EmailAuthProvider.credential(
      currentUser.email || '',
      currentPassword
    );

    // Re-authenticates the user before performing the
    // sensitive email change operation.
    await reauthenticateWithCredential(
      currentUser,
      credential
    );

    console.log('User re-authenticated successfully.');

    // Sends a verification email to the new address.
    await verifyBeforeUpdateEmail(
      currentUser,
      newEmail
    );

    console.log('Email verification sent.');

    setCurrentPassword('');
    setShowPasswordPrompt(false);
    setEditedEmail('');
    setIsEditingEmail(false);

    Alert.alert(
      'Verify Your New Email',
      `A verification email has been sent to ${newEmail}. Please verify the new email address to complete the change.`
    );

  } catch (error: any) {
    console.error('Email update error:', error);

    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      Alert.alert(
        'Incorrect Password',
        'The password you entered is incorrect.'
      );
    } else if (error.code === 'auth/email-already-in-use') {
      Alert.alert(
        'Email Already Used',
        'That email address is already associated with another account.'
      );
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
    } else {
      Alert.alert(
        'Email Update Failed',
        error.message ||
          'Unable to update your email address.'
      );
    }
  } finally {
    setIsSaving(false);
  }
};

const changePassword = async () => {
  if (!currentPassword.trim()) {
    Alert.alert(
      'Current Password Required',
      'Please enter your current password.'
    );
    return;
  }

  if (!newPassword) {
    Alert.alert(
      'New Password Required',
      'Please enter a new password.'
    );
    return;
  }

  if (newPassword.length < 6) {
    Alert.alert(
      'Password Too Short',
      'Your new password must be at least 6 characters long.'
    );
    return;
  }

  if (newPassword !== confirmNewPassword) {
    Alert.alert(
      'Passwords Do Not Match',
      'The new passwords do not match.'
    );
    return;
  }

  if (newPassword === currentPassword) {
    Alert.alert(
      'Invalid Password',
      'Your new password must be different from your current password.'
    );
    return;
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert(
      'Error',
      'You are not currently signed in.'
    );
    return;
  }

  setIsSaving(true);

  try {
    // Creates Firebase credentials using the user's
    // current email and current password.
    const credential = EmailAuthProvider.credential(
      currentUser.email || '',
      currentPassword
    );

    // Re-authenticates the user before changing
    // their password.
    await reauthenticateWithCredential(
      currentUser,
      credential
    );

    // Changes the password in Firebase.
    await updatePassword(
      currentUser,
      newPassword
    );

    console.log('Password updated successfully.');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordChange(false);

    Alert.alert(
      'Password Updated',
      'Your password has been changed successfully.'
    );

  } catch (error: any) {
    console.error('Password update error:', error);

    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      Alert.alert(
        'Incorrect Password',
        'The current password you entered is incorrect.'
      );
    } else if (error.code === 'auth/weak-password') {
      Alert.alert(
        'Weak Password',
        'Please choose a stronger password.'
      );
    } else if (error.code === 'auth/requires-recent-login') {
      Alert.alert(
        'Recent Login Required',
        'Please log out and log back in before changing your password.'
      );
    } else {
      Alert.alert(
        'Password Update Failed',
        error.message ||
          'Unable to update your password.'
      );
    }
  } finally {
    setIsSaving(false);
  }
};

  const updateProfile = async (name: string, email: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Error', 'You are not currently signed in.');
      return;
    }

    setIsSaving(true);

    try {
      const apiUrl =
        `${process.env.EXPO_PUBLIC_API_URL}/api/User/profile/${currentUser.uid}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      });

      const responseText = await response.text();

      console.log('Update profile status:', response.status);
      console.log('Update profile response:', responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);

      setUserName(data.name);
      setUserEmail(data.email);

      setIsEditingName(false);
      setIsEditingEmail(false);

      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
  console.error('Profile update error:', error);

  Alert.alert(
    'Update Failed',
    error.message || 'Unable to update your profile information.'
  );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {showPasswordPrompt && (
  <View style={styles.passwordOverlay}>
    <View style={styles.passwordModal}>
      <Text style={styles.passwordTitle}>
        Confirm Your Password
      </Text>

      <Text style={styles.passwordDescription}>
        Enter your current password to change your email.
      </Text>

      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current password"
        secureTextEntry
        autoCapitalize="none"
        editable={!isSaving}
      />

      <View style={styles.editButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setCurrentPassword('');
            setShowPasswordPrompt(false);
          }}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={confirmEmailChange}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Checking...' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

{showPasswordChange && (
  <View style={styles.passwordOverlay}>
    <View style={styles.passwordModal}>
      <Text style={styles.passwordTitle}>
        Update Password
      </Text>

      <Text style={styles.passwordDescription}>
        Enter your current password and choose a new password.
      </Text>

      <View style={styles.passwordInputContainer}>
  <TextInput
    style={styles.passwordInput}
    value={currentPassword}
    onChangeText={setCurrentPassword}
    placeholder="Current password"
    secureTextEntry={!showCurrentPassword}
    autoCapitalize="none"
    editable={!isSaving}
  />

  <TouchableOpacity
    onPressIn={() => setShowCurrentPassword(true)}
    onPressOut={() => setShowCurrentPassword(false)}
    style={styles.passwordEyeButton}
  >
    <FeatherIcon
      name={showCurrentPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

<View style={[styles.passwordInputContainer, { marginTop: 10 }]}>
  <TextInput
    style={styles.passwordInput}
    value={newPassword}
    onChangeText={setNewPassword}
    placeholder="New password"
    secureTextEntry={!showNewPassword}
    autoCapitalize="none"
    editable={!isSaving}
  />

  <TouchableOpacity
    onPressIn={() => setShowNewPassword(true)}
    onPressOut={() => setShowNewPassword(false)}
    style={styles.passwordEyeButton}
  >
    <FeatherIcon
      name={showNewPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

<View style={[styles.passwordInputContainer, { marginTop: 10 }]}>
  <TextInput
    style={styles.passwordInput}
    value={confirmNewPassword}
    onChangeText={setConfirmNewPassword}
    placeholder="Confirm new password"
    secureTextEntry={!showConfirmPassword}
    autoCapitalize="none"
    editable={!isSaving}
  />

  <TouchableOpacity
    onPressIn={() => setShowConfirmPassword(true)}
    onPressOut={() => setShowConfirmPassword(false)}
    style={styles.passwordEyeButton}
  >
    <FeatherIcon
      name={showConfirmPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

      <View style={styles.editButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');

          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);

          setShowPasswordChange(false);
        }}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={changePassword}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Updating...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FeatherIcon color="#0F172A" name="arrow-left" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>
          Manage your personal details and security preferences below.
        </Text>

        {/* PERSONAL INFORMATION SECTION */}
        <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>

        <View style={styles.cardGroup}>
          {/* Username */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>

            <Text style={styles.rowValueStatic}>
              {isLoading ? 'Loading...' : userNumber}
            </Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Name */}
          {!isEditingName ? (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={startEditingName}
            >
              <Text style={styles.rowLabel}>Name</Text>

              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {isLoading ? 'Loading...' : userName}
                </Text>

                <FeatherIcon
                  color="#C5C5C7"
                  name="chevron-right"
                  size={18}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Name</Text>

              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                autoCapitalize="words"
                editable={!isSaving}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelNameEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveName}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* LOGIN INFORMATION SECTION */}
        <Text style={styles.sectionHeader}>LOGIN INFORMATION</Text>

        <View style={styles.cardGroup}>
          {/* Email */}
          {!isEditingEmail ? (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={startEditingEmail}
            >
              <Text style={styles.rowLabel}>Email</Text>

              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {isLoading ? 'Loading...' : userEmail}
                </Text>

                <FeatherIcon
                  color="#C5C5C7"
                  name="chevron-right"
                  size={18}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Email</Text>

              <TextInput
                style={styles.input}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelEmailEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEmail}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.rowDivider} />

          {/* Password */}
          <TouchableOpacity
  style={styles.row}
  activeOpacity={0.7}
  onPress={() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordChange(true);
  }}
>
  <Text style={styles.rowLabel}>Update password</Text>

  <FeatherIcon
    color="#C5C5C7"
    name="chevron-right"
    size={18}
  />
</TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFB',
  },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 28,
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    paddingLeft: 4,
    lineHeight: 20,
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 8,
    paddingLeft: 4,
  },

  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },

  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '65%',
  },

  rowValue: {
    fontSize: 14,
    color: '#64748B',
  },

  rowValueStatic: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 16,
  },

  editContainer: {
    padding: 16,
  },

  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },

  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  passwordOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  zIndex: 100,
},

passwordModal: {
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  elevation: 5,
},

passwordTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#0F172A',
  marginBottom: 8,
},

passwordDescription: {
  fontSize: 14,
  lineHeight: 20,
  color: '#64748B',
  marginBottom: 16,
},

passwordInputContainer: {
  position: 'relative',
  width: '100%',
},

passwordInput: {
  height: 46,
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingRight: 45,
  fontSize: 14,
  color: '#0F172A',
  backgroundColor: '#F8FAFC',
},

passwordEyeButton: {
  position: 'absolute',
  right: 10,
  top: 0,
  height: 46,
  width: 35,
  alignItems: 'center',
  justifyContent: 'center',
},

});