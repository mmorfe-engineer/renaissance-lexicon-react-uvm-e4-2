import { useEffect, useRef, useState } from 'react';

export function PronunciationControl({ word, audioUrls = [] }) {
  const audioRef = useRef(null);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  async function play() {
    const audio = audioRef.current;
    setBusy(true);
    setMessage('');
    for (let offset = 0; offset < audioUrls.length; offset++) {
      const index = (selected + offset) % audioUrls.length;
      audio.src = audioUrls[index];
      try {
        await audio.play();
        setSelected(index);
        setBusy(false);
        return;
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          setMessage('El navegador bloqueó el audio. Pulsa Escuchar para reintentar.');
          setBusy(false);
          return;
        }
      }
    }
    setMessage('No se pudo reproducir ninguna pronunciación. Inténtalo de nuevo más tarde.');
    setBusy(false);
  }

  if (!audioUrls.length) return <p className="audio-note">Sin audio disponible</p>;
  return <div className="audio-control" role="group" aria-label={`Pronunciaciones de ${word}`}>
    {audioUrls.length > 1 && <><label htmlFor={`audio-${word}`}>Pronunciación</label>
      <select id={`audio-${word}`} value={selected} onChange={e => setSelected(Number(e.target.value))}>
        {audioUrls.map((url, i) => <option key={url} value={i}>Pronunciación {i + 1}</option>)}
      </select></>}
    <button type="button" className="audio-button" onClick={play} disabled={busy}>▶ Escuchar</button>
    <audio ref={audioRef} hidden preload="none" onError={() => {}} />
    {message && <p className="audio-message" role="status">{message}</p>}
  </div>;
}
export default PronunciationControl;
