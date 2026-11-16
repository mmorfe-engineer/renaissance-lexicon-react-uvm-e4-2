/**
 * PronunciationControl component
 * Audio playback for pronunciation
 */
import { useRef, useState } from 'react';

export function PronunciationControl({ audioUrls }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  if (!audioUrls || audioUrls.length === 0) {
    return null;
  }

  const handlePlay = async (url) => {
    if (!audioRef.current) return;

    try {
      // Ensure audio element exists
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      } else {
        audioRef.current.src = url;
      }

      // Set up event listeners
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setError('Error al cargar el audio');
      };

      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setIsPlaying(false);
      setError(err.message || 'Error al reproducir');
    }
  };

  return (
    <div className="pronunciation-control" role="region" aria-label="Pronunciación">
      <button
        onClick={() => handlePlay(audioUrls[0])}
        disabled={isPlaying}
        className="play-button"
        aria-label="Reproducir pronunciación"
        aria-busy={isPlaying}
      >
        {isPlaying ? '▮▮' : '▶'}
      </button>
      
      {error && (
        <span className="audio-error" role="alert">
          {error}
        </span>
      )}
      
      <audio ref={audioRef} hidden />
    </div>
  );
}

export default PronunciationControl;
