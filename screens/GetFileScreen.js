import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import API_URL from './constant';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function GetFileScreen() {
  const [fileId, setFileId] = useState('');
  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    if (!fileId) {
      Alert.alert('Please enter a file ID');
      return;
    }

    setDownloading(true);

    try {
      const metaRes = await fetch(`http://${API_URL}:5000/download/${fileId}`);
      if (!metaRes.ok) {
        const text = await metaRes.text();
        throw new Error(`Error fetching metadata: ${text}`);
      }

      const { filename } = await metaRes.json();
      const getFileExtension = (name) => {
        const match = name.match(/\.(\w+)$/);
        return match ? match[1] : 'bin';
      };

      const ext = getFileExtension(filename);
      const fileUri = FileSystem.documentDirectory + filename;
      const fileUrl = `http://${API_URL}:5000/file/${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
      const { uri } = await downloadResumable.downloadAsync();


      await Sharing.shareAsync(uri);

    } catch (error) {
      Alert.alert('Download failed', error.message);
    }

    setDownloading(false);
  };



  return (
    <View style={styles.container}>
      <View style={styles.aboutBox}>
        <View style={styles.aboutHeader}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color="#1e3a8a"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.aboutHeading}>Retrieve Shared File</Text>
        </View>

        <View style={styles.aboutPoint}>
          <Ionicons
            name="person-outline"
            size={16}
            color="#374151"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.aboutText}>
            Ask the sender to share the unique file ID with you.
          </Text>
        </View>

        <View style={styles.aboutPoint}>
          <Ionicons
            name="key-outline"
            size={16}
            color="#374151"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.aboutText}>
            Paste the file ID into the input field below.
          </Text>
        </View>

        <View style={styles.aboutPoint}>
          <Ionicons
            name="download-outline"
            size={16}
            color="#374151"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.aboutText}>
            Tap the “Get File” button to download the file securely.
          </Text>
        </View>
      </View>

      <View style={styles.downloadBox}>
  <Text style={styles.label}>Enter File ID to Download</Text>

  <TextInput
    style={styles.input}
    placeholder="Enter File ID"
    placeholderTextColor="#9ca3af"
    value={fileId}
    onChangeText={setFileId}
  />

  <TouchableOpacity
    style={[styles.button, downloading && styles.buttonDisabled]}
    onPress={downloadFile}
    disabled={downloading}
  >
    {downloading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.buttonText}> Get File</Text>
    )}
  </TouchableOpacity>
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    justifyContent: 'start',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderColor: '#d1d5db',
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    color: '#111827',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  aboutBox: {
    backgroundColor: '#ECF3F9',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderColor: '#dbeafe',
    borderWidth: 1,
    marginBottom: 20,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  aboutPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  aboutText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  downloadBox: {
  backgroundColor: '#f9fafb',
  padding: 20,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#d1d5db',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 2,
  marginTop: 20,
},

label: {
  fontSize: 15,
  fontWeight: '500',
  color: '#1f2937',
  marginBottom: 8,
},

input: {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 10,
  fontSize: 14,
  color: '#111827',
  marginBottom: 12,
  backgroundColor: '#fff',
},

button: {
  backgroundColor: '#4f46e5',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},

buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

buttonDisabled: {
  backgroundColor: '#9ca3af',
},


});

