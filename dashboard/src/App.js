import React, { useState } from 'react';

function App() {
  const [images, setImages] = useState([]);
  const [timer, setTimer] = useState(30);
  const [count, setCount] = useState(5);

  // Keep track of whether images have been uploaded successfully
  const [uploaded, setUploaded] = useState(false);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  // Upload images and settings to backend
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    formData.append('timer', timer);
    formData.append('count', count);

    try {
      const response = await fetch('https://croquis-bot.onrender.com/upload', { /* ... */ });
      const result = await response.json();
      console.log(result);
      alert('Images uploaded!');
      setUploaded(true);
    } catch (err) {
      console.error(err);
      alert('Upload failed!');
    }
  };

  // Call backend to start the Discord session
  const handleStartSession = async () => {
    if (!uploaded) {
      alert("Please upload images first!");
      return;
    }
    try {
      const response = await fetch('https://croquis-bot.onrender.com/start-session', { /* ... */ });
      const result = await response.json();
      console.log(result);
      alert('Croquis session started in Discord!');
    } catch (err) {
      console.error(err);
      alert('Failed to start session!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Croquis Session Dashboard</h1>
      <form onSubmit={handleUpload}>
        <div>
          <label>Upload Images:</label><br />
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>
        <div>
          <label>Timer per Image (seconds):</label><br />
          <input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} />
        </div>
        <div>
          <label>Number of Images to Show:</label><br />
          <input type="number" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
        <br />
        <button type="submit">Upload Images</button>
      </form>
      <br />
      <button onClick={handleStartSession} disabled={!uploaded}>
        Start Session in Discord
      </button>
    </div>
  );
}

export default App;
