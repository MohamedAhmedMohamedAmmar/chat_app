import { useChat } from "@/context/ChatContext";
import { faDownload, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const FileRenderer = ({ fileId, fileName, fileType, messageType }: { fileId: string; fileName: string; fileType: string; messageType: string }) => {
  const [fileState, setFileState] = useState<{ url: string; loading: boolean; error: string; size: string }>({
    url: '',
    loading: true,
    error: '',
    size: '',
  });
  const {fetchFile,formatFileSize} = useChat();
  useEffect(() => {
    const loadFile = async () => {
      try {
        setFileState(prev => ({ ...prev, loading: true, error: '' }));
        const {url,size}= await fetchFile(fileId);
        setFileState(prev => ({ ...prev, url, size: formatFileSize(size), loading: false }) );
      } catch (err: any) {
        console.error(`Error loading file ${fileId}:`, err);
        setFileState(prev => ({ ...prev, error: err.message || 'Unknown error occurred', loading: false }));
      } finally {
        setFileState(prev => ({ ...prev, loading: false }));
      }
    };

    loadFile();

    return () => {
      if (fileState.url) URL.revokeObjectURL(fileState.url);
    };
  }, [fileId]);

  // Download handler
  const handleDownload = () => {
    if (fileState.url) {
      const link = document.createElement('a');
      link.href = fileState.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Loading state
  if (fileState.loading) {
    return (
      <div className="mb-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse">
        <div className="h-24 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
      </div>
    );
  }

  // Error state
  if (fileState.error) {
    return (
      <div className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">⚠ {fileState.error}</p>
      </div>
    );
  }

  if (!fileState.url) return null;

  // Image renderer
  if (messageType === 'image') {
    return (
      <div className="mb-2 group">
        <div className="relative inline-block">
          <img
            src={fileState.url}
            alt={fileName}
            className="max-w-s rounded-lg shadow-md hover:shadow-lg transition-shadow"
            onError={() => setFileState(prev => ({ ...prev, error: 'Image failed to load' }))}
          />
          <button
            onClick={handleDownload}
            className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Download image"
          >
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Video renderer
  if (messageType === 'video') {
    return (
      <div className="mb-2">
        <div className="relative">
          <video
            controls
            className="max-w-xs rounded-lg shadow-md"
            style={{ maxHeight: '300px' }}
          >
            <source src={fileState.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={handleDownload}
            className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg"
            title="Download video"
          >
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // File renderer
  if (messageType === 'file') {
    return (
      <div className="mb-2">
        <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors group">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faFile} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{fileName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{fileState.size}</p>
          </div>
          <button
            onClick={handleDownload}
            className="shrink-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Download file"
          >
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
export default FileRenderer;