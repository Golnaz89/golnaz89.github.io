// Read Aloud - Azure Speech Text-to-Speech for Blog Posts
(function() {
    'use strict';

    // ============================================
    // CONFIGURATION - Azure Speech details
    // ============================================
    const AZURE_SPEECH_KEY = 'REPLACE_WITH_YOUR_KEY';
    const AZURE_SPEECH_REGION = 'eastus';
    const VOICE_NAME = 'en-US-JennyNeural';   // Natural, friendly voice
    // Other good voices: en-US-AriaNeural, en-US-SaraNeural, en-US-GuyNeural
    // ============================================

    let player = null;
    let synthesizer = null;
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
            case 'playing':
                icon.textContent = '⏸';
                text.textContent = 'Pause';
                btn.classList.add('playing');
                btn.classList.remove('paused');
                break;
            case 'paused':
                icon.textContent = '▶';
                text.textContent = 'Resume';
                btn.classList.remove('playing');
                btn.classList.add('paused');
                break;
            case 'stopped':
            default:
                icon.textContent = '▶';
                text.textContent = 'Listen';
                btn.classList.remove('playing', 'paused');
                break;
        }
    }

    function stopPlayback() {
        if (player) {
            player.pause();
            player.close();
            player = null;
        }
        if (synthesizer) {
            synthesizer.close();
            synthesizer = null;
        }
        isPlaying = false;
        isPaused = false;
        updateButton('stopped');
    }

    function speak(text) {
        if (!window.SpeechSDK) {
            alert('Speech SDK not loaded. Please refresh the page.');
            return;
        }

        try {
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
            speechConfig.speechSynthesisVoiceName = VOICE_NAME;
            
            player = new SpeechSDK.SpeakerAudioDestination();
            
            player.onAudioStart = function() {
                isPlaying = true;
                isPaused = false;
                updateButton('playing');
            };
            
            player.onAudioEnd = function() {
                stopPlayback();
            };

            const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
            synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

            // Start immediately and show playing state
            isPlaying = true;
            isPaused = false;
            updateButton('playing');

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
                    if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        console.error('Synthesis error:', result.errorDetails);
                        stopPlayback();
                        alert('Error: ' + (result.errorDetails || 'Speech synthesis failed'));
                    }
                },
                function(error) {
                    console.error('Synthesis error:', error);
                    stopPlayback();
                    alert('Error: ' + error);
                }
            );
            
        } catch (error) {
            console.error('Speech error:', error);
            stopPlayback();
            alert('Error: ' + error.message);
        }
    }

    function togglePlayPause() {
        if (isPlaying && !isPaused && player) {
            // Pause immediately
            player.pause();
            isPaused = true;
            updateButton('paused');
        } else if (isPaused && player) {
            // Resume
            player.resume();
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
