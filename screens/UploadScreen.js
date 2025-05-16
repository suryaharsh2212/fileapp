import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Share,
    ActivityIndicator,
    Image,
    ToastAndroid,
    Platform,
    StatusBar
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import API_URL from './constant';

export default function UploadScreen({ navigation }) {
    const [fileId, setFileId] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
                const selectedFile = result.assets[0];
                setFile(selectedFile);
            }
        } catch (error) {
            console.log('Error picking document:', error);
        }
    };

    const removeFile = () => {
        setFile(null);
        setFileId(null);
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

    const uploadFileToBackend = async () => {
        if (!file) return;

        setIsLoading(true);
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
            const response = await fetch(`http://${API_URL}:5000/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                Alert.alert('Upload failed', errorText);
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            setFileId(data.fileId);
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
  barStyle="dark-content" 
  backgroundColor="#ECF3F9" 
/>
            <View style={styles.aboutBox}>
                <View style={styles.aboutHeader}>
                    <Ionicons name="information-circle-outline" size={20} color="#1e3a8a" style={{ marginRight: 6 }} />
                    <Text style={styles.aboutHeading}>Secure File Sharing</Text>
                </View>
                <View style={styles.aboutPoint}>
                    <Ionicons name="document-attach-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                    <Text style={styles.aboutText}>Choose a PDF, DOC, or any file securely.</Text>
                </View>
                <View style={styles.aboutPoint}>
                    <Ionicons name="lock-closed-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                    <Text style={styles.aboutText}>Files are encrypted before uploading.</Text>
                </View>
                <View style={styles.aboutPoint}>
                    <Ionicons name="key-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                    <Text style={styles.aboutText}>You get a unique file ID to share safely.</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                <Ionicons name="cloud-upload-outline" size={24} color="#4f46e5" style={{ marginBottom: 10 }} />
                <Text style={styles.uploadText}>Choose Your File</Text>


                {file && (
                    <View style={styles.previewContainer}>
                        {file.mimeType?.startsWith('image/') ? (
                            <Image source={{ uri: file.uri }} style={styles.previewImage} resizeMode="contain" />
                        ) : (
                            <View style={styles.fileInfo}>
                                <Ionicons name="document-text-outline" size={30} color="#4f46e5" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.fileName}>{file.name}</Text>
                                    <Text style={styles.fileType}>{file.mimeType || 'Unknown file type'}</Text>
                                </View>
                            </View>
                        )}
                        <TouchableOpacity onPress={removeFile} style={styles.removeBtn}>
                            <Ionicons name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {file && (
                <TouchableOpacity style={styles.submitButton} onPress={uploadFileToBackend}>
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            )}

            {isLoading && <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />}

            <View style={styles.resultWrapper}>
                {fileId && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultLabel}>Uploaded File ID:</Text>
                        <View style={styles.fileIdBox}>
                            <Text style={styles.fileIdText}>{fileId}</Text>
                            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                                <Ionicons name="copy-outline" size={20} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.navigateButton} onPress={shareFileId}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="share-social-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                                <Text style={styles.navigateText}>Share Code</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                )}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'start',
        alignItems: 'start',
        backgroundColor: '#f1f5f9',
        marginTop: 20,
    },
    uploadBox: {
        borderWidth: 1,
        borderColor: '#4f46e5',
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 24,
        boxShadowColor: '#000',
        boxShadowOffset: { width: 0, height: 10 },
        width: '100%',
        backgroundColor: '#f9f9ff',
        alignItems: 'center',

    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4f46e5',
        marginBottom: 8,
    },
    previewContainer: {
        marginTop: 16,
        width: '100%',
        alignItems: 'center',
    },
    previewImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f2fe',
        padding: 12,
        borderRadius: 10,
        width: '100%',
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e3a8a',
    },
    fileType: {
        fontSize: 12,
        color: '#475569',
    },
    removeBtn: {
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#D9E7F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginTop: 16,
        width: '100%',
        alignItems: 'center',
    },
    submitText: {
        color: '#4f46e5',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        marginTop: 40,
        alignItems: 'center',
        width: '100%',
        padding: 20,
    },
    fileIdBox: {
        backgroundColor: '#e0f2fe',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#0284c7',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIdText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0369a1',
    },
    navigateButton: {
        backgroundColor: '#ECF3F9',

        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    navigateText: {
        color: '#4f46e5',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        marginTop: 50,
        alignItems: 'center',
        width: '100%',
        // borderColor: '',
        // borderRadius: 10,
        // borderWidth: 1,
    },
    resultWrapper: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
    },

    resultContainer: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb', // Tailwind gray-200
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    resultLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151', // Tailwind gray-700
        marginBottom: 10,
    },

    fileIdBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },

    fileIdText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1e40af', // Tailwind blue-800
    },

    copyButton: {
        marginLeft: 15,
    },

    navigateButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    navigateText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    aboutBox: {
        backgroundColor: '#ECF3F9',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#CBDDEB',
        marginBottom: 24,
        width: '100%',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
    },

    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    aboutHeading: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e3a8a',
    },

    aboutPoint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    aboutText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        flex: 1,
    },
    aboutTextBold: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e3a8a',
        lineHeight: 20,
    },

});
