import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform,ActivityIndicator,TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import API_URL from './constant';


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

    // Helper to get extension
    const getFileExtension = (name) => {
      const match = name.match(/\.(\w+)$/);
      return match ? match[1] : 'bin';
    };

    const ext = getFileExtension(filename);

    const fileUri = FileSystem.documentDirectory + filename;

    const fileUrl = `http://${API_URL}:5000/file/${filename}`;

    const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
    const { uri } = await downloadResumable.downloadAsync();

    if (Platform.OS === 'android') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library denied');
      }
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      Alert.alert('Success', 'File downloaded to Downloads folder');
    } else if (Platform.OS === 'ios') {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Downloaded to', uri);
    }

  } catch (error) {
    Alert.alert('Download failed', error.message);
  }

  setDownloading(false);
};


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter File ID to Download:</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. abc123"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    justifyContent: 'center',
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
});

