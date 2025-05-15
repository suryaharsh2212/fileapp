import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Alert, TouchableOpacity, Share } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { ToastAndroid, Platform, } from 'react-native';
import API_URL from './constant';

export default function UploadScreen({ navigation }) {
    const [fileId, setFileId] = useState(null);
    const copyToClipboard = () => {
        Clipboard.setStringAsync(fileId);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied to clipboard!');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                console.log('Picked file:', file);
                const uploadedFileId = await uploadFileToBackend(file);
                setFileId(uploadedFileId);
            }
        } catch (error) {
            console.log('Error picking document:', error);
        }
    };
    const shareFileId = async () => {
        try {
            await Share.share({
                message: `Here's the file ID: ${fileId}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share the file ID.');
        }
    };


    const uploadFileToBackend = async (file) => {
        const fileId = uuidv4();
        const iv = uuidv4();

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
        });
        formData.append('fileId', fileId);
        formData.append('iv', iv);

        try {
            const response = await fetch('http://${API_URL}:5000/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Upload failed:', errorText);
                Alert.alert('Upload failed', errorText);
                return null;
            }

            const data = await response.json();
            // Alert.alert('File uploaded successfully', `File ID: ${data.fileId}`);
            console.log('Response from backend:', data);
            return data.fileId;

        } catch (err) {
            console.log('Fetch error:', err.message);
            Alert.alert('Error', err.message);
            return null;
        }
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                <Ionicons name="cloud-upload-outline" size={24} color="#4f46e5" style={{ marginRight: 8 }} />
                <Text style={styles.uploadText}>Choose Your File</Text>
            </TouchableOpacity>

            {fileId && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Uploaded File ID:</Text>
                    <View style={styles.fileIdBox}>
                        <Text style={styles.fileIdText}>{fileId}</Text>
                        <TouchableOpacity onPress={copyToClipboard} style={{ marginLeft: 8 }}>
                            <Ionicons name="copy-outline" size={20} color="#4f46e5" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={shareFileId}
                    >
                        <Text style={styles.navigateText}>Share Code ➡️</Text>
                    </TouchableOpacity>
                </View>

            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8FF',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#4f46e5',
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 80,
        backgroundColor: '#F5FEFD',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', // This aligns icon + text side by side
        backgroundColor: '#f9f9ff',
        marginVertical: 16,
    },

    uploadText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4f46e5',
    },
    resultContainer: {
        marginTop: 100,
        alignItems: 'center',
        width: '100%',
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#111827',
    },
    fileIdBox: {

        backgroundColor: '#e0f2fe',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#0284c7',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIdText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0369a1',
    },
    navigateButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    navigateText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

