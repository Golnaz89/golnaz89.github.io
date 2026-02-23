// Read Aloud - Azure Speech Text-to-Speech for Blog Posts
(function() {
    'use strict';

    // ============================================
    // CONFIGURATION - Azure Speech details
    // ============================================
    const AZURE_SPEECH_KEY = 'REPLACE_WITH_YOUR_KEY';
    const AZURE_SPEECH_REGION = 'eastus';
    const VOICE_NAME = 'en-US-AvaMultilingualNeural';   // Natural, friendly voice
    // Other good voices: en-US-JennyNeural, en-US-AriaNeural, en-US-SaraNeural
    // ============================================

    let audioElement = null;
    let isPlaying = false;
    let isPaused = false;

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

    async function synthesizeSpeech(text) {
        if (!window.SpeechSDK) {
            throw new Error('Speech SDK not loaded');
        }

        return new Promise((resolve, reject) => {
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
            speechConfig.speechSynthesisVoiceName = VOICE_NAME;
            speechConfig.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;
            
            const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

            const ssml = `
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                    <voice name="${VOICE_NAME}">
                        <prosody rate="0%" pitch="0%">
                            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        </prosody>
                    </voice>
                </speak>
            `;

            synthesizer.speakSsmlAsync(
                ssml,
                function(result) {
                    synthesizer.close();
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        const blob = new Blob([result.audioData], { type: 'audio/mp3' });
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error(result.errorDetails || 'Synthesis failed'));
                    }
                },
                function(error) {
                    synthesizer.close();
                    reject(error);
                }
            );
        });
    }

    async function speak(text) {
        updateButton('loading');
        
        try {
            const audioUrl = await synthesizeSpeech(text);
            
            audioElement = new Audio(audioUrl);
            
            audioElement.onended = function() {
                isPlaying = false;
                isPaused = false;
                updateButton('stopped');
            };

            audioElement.onerror = function(e) {
                console.error('Audio playback error:', e);
                isPlaying = false;
                isPaused = false;
                updateButton('stopped');
            };
            
            await audioElement.play();
            isPlaying = true;
            isPaused = false;
            updateButton('playing');
            
        } catch (error) {
            console.error('Speech synthesis error:', error);
            isPlaying = false;
            isPaused = false;
            updateButton('stopped');
            
            if (AZURE_SPEECH_KEY === 'REPLACE_WITH_YOUR_KEY') {
                alert('Azure Speech key not configured.');
            } else {
                alert('Error: ' + error.message);
            }
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
            if (audioElement) {
                audioElement.pause();
                audioElement = null;
            }
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
            if (audioElement) {
                audioElement.pause();
            }
        });
    }

    function waitForSDK() {
        if (window.SpeechSDK) {
            init();
        } else {
            setTimeout(waitForSDK, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForSDK);
    } else {
        waitForSDK();
    }
})();
