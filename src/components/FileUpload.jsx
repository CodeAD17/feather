import { useState, useRef } from 'react';
import { Upload, Image, FileText, X } from 'lucide-react';
import './FileUpload.css';

function FileUpload({ onFileSelect, accept = 'image/*,.pdf', multiple = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const inputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(Array.from(e.dataTransfer.files));
    };

    const handleChange = (e) => {
        processFiles(Array.from(e.target.files));
    };

    const processFiles = (newFiles) => {
        const processed = newFiles.map((file) => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatSize(file.size),
            type: file.type.startsWith('image/') ? 'image' : 'document',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));
        const updated = multiple ? [...files, ...processed] : processed;
        setFiles(updated);
        onFileSelect(updated);
    };

    const removeFile = (id) => {
        const updated = files.filter((f) => f.id !== id);
        setFiles(updated);
        onFileSelect(updated);
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="file-upload">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    hidden
                />

                <div className="upload-content">
                    <div className="upload-icon">
                        <Image size={28} />
                    </div>
                    <div className="upload-text">
                        <p className="upload-primary">Drop your certificate here</p>
                        <p className="upload-secondary">or click to browse</p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="file-list">
                    {files.map((file) => (
                        <div key={file.id} className="file-item">
                            {file.preview ? (
                                <img src={file.preview} alt={file.name} className="file-thumb" />
                            ) : (
                                <div className="file-icon">
                                    <FileText size={20} />
                                </div>
                            )}
                            <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{file.size}</span>
                            </div>
                            <button
                                className="btn btn-ghost btn-icon file-remove"
                                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FileUpload;
