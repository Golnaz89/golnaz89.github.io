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
    
    // Timeline tracking
    let totalTextLength = 0;
    let chunkStartPositions = []; // Character positions where each chunk starts
    let estimatedTotalDuration = 0; // Estimated total duration in seconds
    let chunkDurations = []; // Actual durations of played chunks
    let elapsedTime = 0; // Total elapsed time across all chunks

    function getPostContent() {
        const postContent = document.querySelector('.post-content');
        if (!postContent) return '';

        const clone = postContent.cloneNode(true);
        clone.querySelectorAll('script, style, img, video, audio, iframe').forEach(el => el.remove());
        
        return clone.textContent
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Split text into chunks - first chunk small for fast start, rest larger
    function splitIntoChunks(text) {
        const chunks = [];
        chunkStartPositions = [0]; // Reset and track start positions
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = '';
        let charPosition = 0;
        const FIRST_CHUNK_SIZE = 150;  // Small first chunk for quick start
        const CHUNK_SIZE = 400;        // Regular chunks
        
        for (const sentence of sentences) {
            const maxSize = chunks.length === 0 ? FIRST_CHUNK_SIZE : CHUNK_SIZE;
            if (currentChunk.length + sentence.length > maxSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                charPosition += currentChunk.length;
                chunkStartPositions.push(charPosition);
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        totalTextLength = text.length;
        // Estimate ~150 words per minute, ~5 chars per word
        estimatedTotalDuration = (totalTextLength / 5) / 150 * 60;
        return chunks;
    }

    // Format time as m:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Create and inject timeline UI
    function createTimelineUI() {
        const btn = document.getElementById('read-aloud-btn');
        if (!btn || document.querySelector('.read-aloud-player')) return;

        // Wrap button in player container
        const player = document.createElement('div');
        player.className = 'read-aloud-player';
        btn.parentNode.insertBefore(player, btn);
        player.appendChild(btn);

        // Create timeline
        const timeline = document.createElement('div');
        timeline.className = 'read-aloud-timeline';
        timeline.innerHTML = `
            <div class="timeline-track">
                <div class="timeline-buffered"></div>
                <div class="timeline-progress"></div>
                <div class="timeline-handle"></div>
            </div>
            <div class="timeline-time">
                <span class="time-current">0:00</span>
                <span class="time-total">0:00</span>
            </div>
        `;
        player.appendChild(timeline);

        // Add click-to-seek on timeline
        const track = timeline.querySelector('.timeline-track');
        track.addEventListener('click', handleTimelineClick);
    }

    // Update timeline UI
    function updateTimeline() {
        const progress = document.querySelector('.timeline-progress');
        const buffered = document.querySelector('.timeline-buffered');
        const handle = document.querySelector('.timeline-handle');
        const currentTime = document.querySelector('.time-current');
        const totalTime = document.querySelector('.time-total');
        
        if (!progress) return;

        // Calculate current position
        let currentPos = 0;
        if (audioElement && !audioElement.paused) {
            currentPos = elapsedTime + audioElement.currentTime;
        } else {
            currentPos = elapsedTime;
        }

        // Calculate buffered progress (chunks ready)
        const readyChunks = audioQueue.filter(url => url !== null).length;
        const bufferedPercent = (readyChunks / textChunks.length) * 100;

        // Calculate playback progress
        const progressPercent = estimatedTotalDuration > 0 
            ? Math.min((currentPos / estimatedTotalDuration) * 100, 100)
            : 0;

        progress.style.width = `${progressPercent}%`;
        buffered.style.width = `${bufferedPercent}%`;
        handle.style.left = `${progressPercent}%`;
        
        currentTime.textContent = formatTime(currentPos);
        totalTime.textContent = formatTime(estimatedTotalDuration);
    }

    // Handle click on timeline to seek
    function handleTimelineClick(e) {
        if (!isPlaying || textChunks.length === 0) return;
        
        const track = e.currentTarget;
        const rect = track.getBoundingClientRect();
        const clickPercent = (e.clientX - rect.left) / rect.width;
        const targetTime = clickPercent * estimatedTotalDuration;
        
        // Find which chunk this time falls into
        let accumulatedTime = 0;
        let targetChunk = 0;
        
        for (let i = 0; i < textChunks.length; i++) {
            const chunkDuration = chunkDurations[i] || (textChunks[i].length / 5 / 150 * 60);
            if (accumulatedTime + chunkDuration > targetTime) {
                targetChunk = i;
                break;
            }
            accumulatedTime += chunkDuration;
            targetChunk = i;
        }
        
        // Can only seek to chunks that are already loaded
        if (audioQueue[targetChunk]) {
            // Stop current playback
            if (audioElement) {
                audioElement.pause();
            }
            
            // Calculate elapsed time up to target chunk
            elapsedTime = 0;
            for (let i = 0; i < targetChunk; i++) {
                elapsedTime += chunkDurations[i] || (textChunks[i].length / 5 / 150 * 60);
            }
            
            currentChunkIndex = targetChunk;
            playNextChunk();
        }
    }

    // Start timeline update loop
    let timelineInterval = null;
    function startTimelineUpdates() {
        if (timelineInterval) clearInterval(timelineInterval);
        timelineInterval = setInterval(updateTimeline, 100);
    }

    function stopTimelineUpdates() {
        if (timelineInterval) {
            clearInterval(timelineInterval);
            timelineInterval = null;
        }
    }

    function updateButton(state) {
        const btn = document.getElementById('read-aloud-btn');
        if (!btn) return;
        
        const icon = btn.querySelector('.read-aloud-icon');
        const text = btn.querySelector('.read-aloud-text');
        const player = document.querySelector('.read-aloud-player');
        
        switch(state) {
            case 'loading':
                icon.textContent = '⏳';
                text.textContent = 'Loading...';
                btn.classList.add('loading');
                btn.classList.remove('playing', 'paused');
                if (player) player.classList.add('active');
                break;
            case 'playing':
                icon.textContent = '⏸';
                text.textContent = 'Pause';
                btn.classList.add('playing');
                btn.classList.remove('paused', 'loading');
                if (player) player.classList.add('active');
                break;
            case 'paused':
                icon.textContent = '▶';
                text.textContent = 'Resume';
                btn.classList.remove('playing', 'loading');
                btn.classList.add('paused');
                if (player) player.classList.add('active');
                break;
            case 'stopped':
            default:
                icon.textContent = '▶';
                text.textContent = 'Listen';
                btn.classList.remove('playing', 'paused', 'loading');
                if (player) player.classList.remove('active');
                break;
        }
    }

    function stopPlayback() {
        stopTimelineUpdates();
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
        // Clean up queued audio URLs
        audioQueue.forEach(url => { if (url) URL.revokeObjectURL(url); });
        audioQueue = [];
        textChunks = [];
        currentChunkIndex = 0;
        isPlaying = false;
        isPaused = false;
        isGenerating = false;
        // Reset timeline state
        elapsedTime = 0;
        chunkDurations = [];
        chunkStartPositions = [];
        updateTimeline();
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
        // Find next chunks that need generating
        for (let i = 0; i < textChunks.length && isGenerating; i++) {
            if (audioQueue[i] === null) {
                try {
                    const audioUrl = await generateChunkAudio(textChunks[i]);
                    if (isGenerating) {
                        audioQueue[i] = audioUrl;
                    }
                } catch (e) {
                    if (e.name !== 'AbortError') console.error('Preload error:', e);
                }
            }
        }
    }

    function playNextChunk() {
        if (!isPlaying || currentChunkIndex >= textChunks.length) {
            stopPlayback();
            return;
        }

        if (!audioQueue[currentChunkIndex]) {
            // Audio not ready yet, wait a bit
            setTimeout(playNextChunk, 100);
            return;
        }

        const audioUrl = audioQueue[currentChunkIndex];
        const chunkIdx = currentChunkIndex;
        audioElement = new Audio(audioUrl);
        
        // Track actual duration when metadata loads
        audioElement.onloadedmetadata = function() {
            chunkDurations[chunkIdx] = audioElement.duration;
            // Recalculate estimated total duration based on actual durations
            let knownDuration = 0;
            let knownChars = 0;
            for (let i = 0; i < chunkDurations.length; i++) {
                if (chunkDurations[i]) {
                    knownDuration += chunkDurations[i];
                    knownChars += textChunks[i].length;
                }
            }
            if (knownChars > 0) {
                const avgSecsPerChar = knownDuration / knownChars;
                estimatedTotalDuration = totalTextLength * avgSecsPerChar;
            }
        };
        
        audioElement.onended = function() {
            // Add this chunk's duration to elapsed time
            if (chunkDurations[chunkIdx]) {
                elapsedTime += chunkDurations[chunkIdx];
            }
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
        createTimelineUI();
        updateButton('loading');
        abortController = new AbortController();
        isGenerating = true;
        chunkDurations = [];
        elapsedTime = 0;
        
        textChunks = splitIntoChunks(text);
        currentChunkIndex = 0;
        audioQueue = new Array(textChunks.length).fill(null);
        
        // Show initial timeline state
        updateTimeline();
        startTimelineUpdates();
        
        try {
            // Generate first 2 chunks in parallel for faster start
            const firstChunksToGenerate = Math.min(2, textChunks.length);
            const promises = [];
            for (let i = 0; i < firstChunksToGenerate; i++) {
                promises.push(generateChunkAudio(textChunks[i]).then(url => ({ index: i, url })));
            }
            
            // Wait for first chunk only, start playing immediately
            const first = await Promise.race(promises.map((p, i) => p.then(r => r)));
            if (!isGenerating) return;
            
            audioQueue[first.index] = first.url;
            
            // If first chunk ready, start playing
            if (audioQueue[0]) {
                isPlaying = true;
                isPaused = false;
                updateButton('playing');
                playNextChunk();
            }
            
            // Collect remaining parallel results and preload more
            Promise.all(promises).then(results => {
                results.forEach(r => {
                    if (isGenerating && !audioQueue[r.index]) {
                        audioQueue[r.index] = r.url;
                    }
                });
                preloadNextChunks();
            });
            
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
