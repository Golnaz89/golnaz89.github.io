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

    let synthesizer = null;
    let player = null;
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
                btn.disabled = true;
                break;
            case 'playing':
                icon.textContent = '⏸';
                text.textContent = 'Pause';
                btn.classList.add('playing');
                btn.classList.remove('paused', 'loading');
                btn.disabled = false;
                break;
            case 'paused':
                icon.textContent = '▶';
                text.textContent = 'Resume';
                btn.classList.remove('playing', 'loading');
                btn.classList.add('paused');
                btn.disabled = false;
                break;
            case 'stopped':
            default:
                icon.textContent = '▶';
                text.textContent = 'Listen';
                btn.classList.remove('playing', 'paused', 'loading');
                btn.disabled = false;
                break;
        }
    }

    function initSynthesizer() {
        if (!window.SpeechSDK) {
            console.error('Speech SDK not loaded');
            return null;
        }

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
        speechConfig.speechSynthesisVoiceName = VOICE_NAME;
        
        player = new SpeechSDK.SpeakerAudioDestination();
        const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
        
        player.onAudioEnd = function() {
            isPlaying = false;
            isPaused = false;
            updateButton('stopped');
        };

        return new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    }

    function speak(text) {
        updateButton('loading');
        
        if (!synthesizer) {
            synthesizer = initSynthesizer();
        }
        
        if (!synthesizer) {
            alert('Speech SDK failed to load. Please refresh the page.');
            updateButton('stopped');
            return;
        }

        // Enable pause as soon as we start
        isPlaying = true;
        isPaused = false;
        updateButton('playing');

        // Use SSML for better control
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
                    console.error('Speech synthesis failed:', result.errorDetails);
                    isPlaying = false;
                    isPaused = false;
                    updateButton('stopped');
                    alert('Error generating speech: ' + result.errorDetails);
                }
            },
            function(error) {
                console.error('Speech synthesis error:', error);
                isPlaying = false;
                isPaused = false;
                updateButton('stopped');
                alert('Error generating speech. Please check your Azure Speech configuration.');
            }
        );
    }

    function togglePlayPause() {
        if (isPlaying && !isPaused && player) {
            // Pause
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
            if (synthesizer) {
                synthesizer.close();
                synthesizer = null;
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

        // Clean up when leaving the page
        window.addEventListener('beforeunload', function() {
            if (synthesizer) {
                synthesizer.close();
            }
        });
    }

    // Wait for SDK to load, then initialize
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
