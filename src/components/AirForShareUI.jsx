import React, { useState, useEffect } from 'react';
import { FiMenu, FiFileText, FiTrash2 } from 'react-icons/fi'; 
import { 
    db, 
    collection, 
    addDoc, 
    serverTimestamp,
    deleteDoc, 
    doc,
    getDocs
} from '../firebaseConfig.js'; 
import './AirForShareUI.css';

const AirForShareUI = () => {
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); 
    const [lastSavedDocId, setLastSavedDocId] = useState(null); 
    const [activeTab, setActiveTab] = useState('text');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [hoveredFileId, setHoveredFileId] = useState(null);
    
    const isSaveActive = text.trim().length > 0 && !isSaving;
    const isClearActive = text.trim().length > 0 && !isSaving && !isClearing;

    // --- Load Text on Refresh ---
    const loadTextFromFirebase = async () => {
        try {
            const notesCollectionRef = collection(db, 'notes');
            const snapshot = await getDocs(notesCollectionRef);
            if (!snapshot.empty) {
                const notes = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setText(notes[0].content || '');
                setLastSavedDocId(notes[0].id);
            }
        } catch (error) {
            console.error('Error loading text:', error);
        }
    };

    // --- Handle Text Input ---
    const handleTextChange = (event) => {
        setText(event.target.value);
        if (saveStatus) setSaveStatus('');
    };

    // --- Save Text to Firebase ---
    const handleSave = async () => {
        if (!isSaveActive) return;
        setIsSaving(true);
        setSaveStatus('saving');

        try {
            const docRef = await addDoc(collection(db, 'notes'), {
                content: text,
                createdAt: serverTimestamp(),
            });
            setLastSavedDocId(docRef.id);
            setSaveStatus('success');
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // --- Clear Text ---
    const handleClear = async () => {
        if (!isClearActive) return;
        setIsClearing(true);

        if (lastSavedDocId) {
            try {
                await deleteDoc(doc(db, 'notes', lastSavedDocId));
                setLastSavedDocId(null);
            } catch (e) {
                console.error('Error deleting document: ', e);
            }
        }

        setText('');
        setSaveStatus('');
        setIsClearing(false);
    };

    // --- Upload File ---
    const handleFileChange = async (e) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setSelectedFile(file);
        setIsUploading(true);

        const cloudName = 'dpchkixzv';
        const uploadPreset = 'TempImgUpload';
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        try {
            const fetchUrl = file.type.startsWith('image')
                ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
                : `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

            const res = await fetch(fetchUrl, { method: 'POST', body: data });
            const result = await res.json();
            setFileUrl(result.secure_url);

            await addDoc(collection(db, 'files'), {
                fileName: file.name,
                fileUrl: result.secure_url,
                createdAt: serverTimestamp(),
            });
            loadFilesFromFirebase();
        } catch {
            alert('Upload failed!');
        }
        setIsUploading(false);
    };

    // --- Load Files ---
    const loadFilesFromFirebase = async () => {
        setIsLoadingFiles(true);
        try {
            const filesCollectionRef = collection(db, 'files');
            const snapshot = await getDocs(filesCollectionRef);
            const filesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUploadedFiles(filesList);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
        setIsLoadingFiles(false);
    };

    // --- Delete File ---
    const handleDeleteFile = async (fileId) => {
        try {
            await deleteDoc(doc(db, 'files', fileId));
            setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    // --- Auto Load ---
    useEffect(() => {
        loadTextFromFirebase();
        if (activeTab === 'file') loadFilesFromFirebase();
    }, [activeTab]);

    let saveButtonText;
    if (isSaving) saveButtonText = 'Saving...';
    else if (saveStatus === 'success') saveButtonText = 'Saved!';
    else if (saveStatus === 'error') saveButtonText = 'Error';
    else saveButtonText = 'Save';

    return (
        <div className="airforshare-container">
            {/* --- Top Nav --- */}
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-air">air</span>
                    <span className="logo-for-share">for share</span>
                </div>
                <div className="nav-links">
                    <a href="#login-register" className="login-register">Login / Register</a>
                </div>
            </nav>

            {/* --- Main Section --- */}
            <main className="content-card-wrapper">
                <div className="content-card">
                    <aside className="card-sidebar">
                        <div className={`sidebar-icon${activeTab === 'text' ? ' active-icon' : ''}`} onClick={() => setActiveTab('text')}>
                            <FiMenu size={24} />
                        </div>
                        <div className={`sidebar-icon${activeTab === 'file' ? ' active-icon' : ''}`} onClick={() => setActiveTab('file')}>
                            <FiFileText size={24} />
                        </div>
                    </aside>

                    <section className="card-main-content">
                        {/* --- TEXT TAB --- */}
                        {activeTab === 'text' && (
                            <>
                                <h1 className="content-title">Text</h1>
                                <textarea
                                    placeholder="Type something..."
                                    className="text-input"
                                    value={text}
                                    onChange={handleTextChange}
                                    disabled={isSaving || isClearing}
                                />
                                <div className="action-buttons-wrapper">
                                    <button className={`clear-button ${isClearActive ? 'active' : ''}`} onClick={handleClear} disabled={!isClearActive}>
                                        {isClearing ? 'Clearing...' : 'Clear'}
                                    </button>
                                    <button className={`save-button ${isSaveActive ? 'active' : ''} ${saveStatus}`} onClick={handleSave} disabled={!isSaveActive}>
                                        {saveButtonText}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- FILE TAB --- */}
                        {activeTab === 'file' && (
                            <>
                                <h1 className="content-title">File</h1>
                                <div className="file-upload-section">
                                    <button
                                        className="plus-icon-button"
                                        onClick={() => document.getElementById('hidden-file-input').click()}
                                        disabled={isUploading}
                                        title="Upload new file"
                                    >
                                        +
                                    </button>
                                    <input id="hidden-file-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                                    {isUploading && <p>Uploading...</p>}
                                </div>

                                {/* --- FILE GALLERY --- */}
                                <div className="uploaded-files-gallery">
                                    {isLoadingFiles ? (
                                        <p>Loading files...</p>
                                    ) : uploadedFiles.length === 0 ? (
                                        <p>No files uploaded yet.</p>
                                    ) : (
                                        uploadedFiles.map(file => (
                                            <div
                                                key={file.id}
                                                className="file-item"
                                                onMouseEnter={() => setHoveredFileId(file.id)}
                                                onMouseLeave={() => setHoveredFileId(null)}
                                            >
                                                {file.fileUrl && file.fileUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                    <img src={file.fileUrl} alt={file.fileName} className="uploaded-image" />
                                                ) : (
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="open-link">
                                                        Open File
                                                    </a>
                                                )}

                                                {hoveredFileId === file.id && (
                                                    <button className="delete-icon" onClick={() => handleDeleteFile(file.id)}>
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AirForShareUI;
