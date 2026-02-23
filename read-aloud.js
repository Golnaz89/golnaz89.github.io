// Read Aloud - ElevenLabs Text-to-Speech for Blog Posts
(function() {
    'use strict';

    // ============================================
    // CONFIGURATION - ElevenLabs details
    // ============================================
    const ELEVENLABS_API_KEY = 'REPLACE_WITH_YOUR_KEY';
    const VOICE_ID = '5O9bGNrPTviUOxnusv12';
    // ============================================

    let audioElement = null;
    let isPlaying = false;
    let isPaused = false;
    let abortController = null;
    let textChunks = [];
    let currentChunkIndex = 0;
    let audioQueue = [];
    let isGenerating = false;

    function getPostContent() {
        const postContent = document.querySelector('.post-content');
        if (!postContent) return '';

        const clone = postContent.cloneNode(true);
        clone.querySelectorAll('script, style, img, video, audio, iframe').forEach(el => el.remove());
        
        return clone.textContent
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Split text into chunks (~500 chars each, at sentence boundaries)
    function splitIntoChunks(text) {
        const chunks = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > 500 && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }

    function updateButton(state) {
        const btn = document.getElementById('read-aloud-btn');
        if (!btn) return;
        
        const icon = btn.querySelector('.read-aloud-icon');
        const text = btn.querySelector('.read-aloud-text');
        
        switch(state) {
            case 'loading':
                icon.textContent = '⏳';
                text.textContent = 'Loading...';
                btn.classList.add('loading');
                btn.classList.remove('playing', 'paused');
                break;
            case 'playing':
                icon.textContent = '⏸';
                text.textContent = 'Pause';
                btn.classList.add('playing');
                btn.classList.remove('paused', 'loading');
                break;
            case 'paused':
                icon.textContent = '▶';
                text.textContent = 'Resume';
                btn.classList.remove('playing', 'loading');
                btn.classList.add('paused');
                break;
            case 'stopped':
            default:
                icon.textContent = '▶';
                text.textContent = 'Listen';
                btn.classList.remove('playing', 'paused', 'loading');
                break;
        }
    }

    function stopPlayback() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
        // Clean up queued audio URLs
        audioQueue.forEach(url => URL.revokeObjectURL(url));
        audioQueue = [];
        textChunks = [];
        currentChunkIndex = 0;
        isPlaying = false;
        isPaused = false;
        isGenerating = false;
        updateButton('stopped');
    }

    async function generateChunkAudio(text) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
        }

        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
    }

    async function preloadNextChunks() {
        // Generate next 2 chunks in background
        while (isGenerating && audioQueue.length < currentChunkIndex + 3 && audioQueue.length < textChunks.length) {
            const idx = audioQueue.length;
            try {
                const audioUrl = await generateChunkAudio(textChunks[idx]);
                if (isGenerating) {
                    audioQueue.push(audioUrl);
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error('Preload error:', e);
                break;
            }
        }
    }

    function playNextChunk() {
        if (!isPlaying || currentChunkIndex >= textChunks.length) {
            stopPlayback();
            return;
        }

        if (currentChunkIndex >= audioQueue.length) {
            // Audio not ready yet, wait a bit
            setTimeout(playNextChunk, 100);
            return;
        }

        const audioUrl = audioQueue[currentChunkIndex];
        audioElement = new Audio(audioUrl);
        
        audioElement.onended = function() {
            currentChunkIndex++;
            if (isPlaying && !isPaused) {
                playNextChunk();
            }
        };

        audioElement.onerror = function(e) {
            console.error('Audio playback error:', e);
            stopPlayback();
        };

        audioElement.play().catch(e => {
            console.error('Play error:', e);
            stopPlayback();
        });
    }

    async function speak(text) {
        updateButton('loading');
        abortController = new AbortController();
        isGenerating = true;
        
        textChunks = splitIntoChunks(text);
        currentChunkIndex = 0;
        audioQueue = [];
        
        try {
            // Generate first chunk and start playing immediately
            const firstAudioUrl = await generateChunkAudio(textChunks[0]);
            if (!isGenerating) return;
            
            audioQueue.push(firstAudioUrl);
            isPlaying = true;
            isPaused = false;
            updateButton('playing');
            
            // Start playing first chunk
            playNextChunk();
            
            // Preload remaining chunks in background
            preloadNextChunks();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Speech synthesis error:', error);
            stopPlayback();
            alert('Error: ' + error.message);
        }
    }

    function togglePlayPause() {
        if (isPlaying && !isPaused && audioElement) {
            audioElement.pause();
            isPaused = true;
            updateButton('paused');
        } else if (isPaused && audioElement) {
            audioElement.play();
            isPaused = false;
            updateButton('playing');
        } else {
            stopPlayback();
            const text = getPostContent();
            if (text) {
                speak(text);
            }
        }
    }

    function init() {
        const btn = document.getElementById('read-aloud-btn');
        if (!btn) return;

        btn.addEventListener('click', togglePlayPause);

        window.addEventListener('beforeunload', function() {
            stopPlayback();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
