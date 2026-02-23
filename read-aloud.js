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

    function getPostContent() {
        const postContent = document.querySelector('.post-content');
        if (!postContent) return '';

        const clone = postContent.cloneNode(true);
        clone.querySelectorAll('script, style, img, video, audio, iframe').forEach(el => el.remove());
        
        return clone.textContent
            .replace(/\s+/g, ' ')
            .trim();
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
        isPlaying = false;
        isPaused = false;
        updateButton('stopped');
    }

    async function speak(text) {
        updateButton('loading');
        abortController = new AbortController();
        
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
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
            const audioUrl = URL.createObjectURL(audioBlob);
            
            audioElement = new Audio(audioUrl);
            
            audioElement.onended = function() {
                URL.revokeObjectURL(audioUrl);
                stopPlayback();
            };

            audioElement.onerror = function(e) {
                console.error('Audio playback error:', e);
                URL.revokeObjectURL(audioUrl);
                stopPlayback();
            };
            
            await audioElement.play();
            isPlaying = true;
            isPaused = false;
            updateButton('playing');
            
        } catch (error) {
            if (error.name === 'AbortError') {
                return; // User cancelled
            }
            console.error('Speech synthesis error:', error);
            stopPlayback();
            alert('Error: ' + error.message);
        }
    }

    function togglePlayPause() {
        if (isPlaying && !isPaused && audioElement) {
            // Pause
            audioElement.pause();
            isPaused = true;
            updateButton('paused');
        } else if (isPaused && audioElement) {
            // Resume
            audioElement.play();
            isPaused = false;
            updateButton('playing');
        } else {
            // Start fresh
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
