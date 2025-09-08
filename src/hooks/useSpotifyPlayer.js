import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

const useSpotifyPlayer = () => {
  const { spotifyToken, getFreshSpotifyToken } = useAuth()
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [playerState, setPlayerState] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isPremium, setIsPremium] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const playerRef = useRef(null)
  const initializationRef = useRef(false)

  // Check if user has Spotify Premium
  const checkPremiumStatus = useCallback(async () => {
    try {
      const token = await getFreshSpotifyToken()
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const user = await response.json()
        setIsPremium(user.product === 'premium')
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
      setIsPremium(false)
    }
  }, [getFreshSpotifyToken])

  // Initialize Spotify Web Playback SDK
  const initializePlayer = useCallback(async () => {
    if (initializationRef.current || !spotifyToken) return
    
    setLoading(true)
    setError(null)
    initializationRef.current = true

    try {
      // Load Spotify SDK script
      if (!window.Spotify) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://sdk.scdn.co/spotify-player.js'
          script.async = true
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      // Wait for SDK to be ready
      await new Promise((resolve) => {
        if (window.Spotify) {
          resolve()
        } else {
          window.onSpotifyWebPlaybackSDKReady = resolve
        }
      })

      // Create player instance
      const player = new window.Spotify.Player({
        name: 'Spotify Web Player',
        getOAuthToken: async (cb) => {
          try {
            const token = await getFreshSpotifyToken()
            cb(token)
          } catch (error) {
            setError('Failed to get Spotify token')
            console.error('Token error:', error)
          }
        },
        volume: 0.5
      })

      // Add event listeners
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        setDeviceId(device_id)
        setIsReady(true)
        setError(null)
      })

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
        setIsReady(false)
        setIsActive(false)
      })

      player.addListener('player_state_changed', (state) => {
        if (!state) return
        
        setPlayerState(state)
        setIsActive(!!state)
        
        // Update current track info
        if (state.track_window?.current_track) {
          console.log('Currently playing:', state.track_window.current_track)
        }
      })

      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message)
        setError(`Initialization failed: ${message}`)
      })

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message)
        setError(`Authentication failed: ${message}`)
      })

      player.addListener('account_error', ({ message }) => {
        console.error('Account error:', message)
        if (message.includes('premium')) {
          setIsPremium(false)
          setError('Spotify Premium required for playback')
        } else {
          setError(`Account error: ${message}`)
        }
      })

      player.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message)
        setError(`Playback error: ${message}`)
      })

      // Connect to the player
      const connected = await player.connect()
      
      if (connected) {
        setPlayer(player)
        playerRef.current = player
        await checkPremiumStatus()
      } else {
        throw new Error('Failed to connect to Spotify player')
      }

    } catch (error) {
      console.error('Error initializing player:', error)
      setError(error.message || 'Failed to initialize Spotify player')
    } finally {
      setLoading(false)
      initializationRef.current = false
    }
  }, [spotifyToken, getFreshSpotifyToken, checkPremiumStatus])

  // Cleanup player on unmount or token change
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
        setPlayer(null)
        setDeviceId(null)
        setIsReady(false)
        setIsActive(false)
        initializationRef.current = false
      }
    }
  }, [spotifyToken])

  // Initialize player when token is available
  useEffect(() => {
    if (spotifyToken && !player && !initializationRef.current) {
      initializePlayer()
    }
  }, [spotifyToken, player, initializePlayer])

  // Player control methods
  const play = useCallback(async (uris) => {
    if (!player || !deviceId) {
      setError('Player not ready')
      return false
    }

    try {
      if (uris) {
        // Play specific tracks
        const token = await getFreshSpotifyToken()
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris })
        })
      } else {
        // Resume playback
        await player.resume()
      }
      return true
    } catch (error) {
      console.error('Play error:', error)
      setError('Failed to play track')
      return false
    }
  }, [player, deviceId, getFreshSpotifyToken])

  const pause = useCallback(async () => {
    if (!player) return false
    
    try {
      await player.pause()
      return true
    } catch (error) {
      console.error('Pause error:', error)
      setError('Failed to pause')
      return false
    }
  }, [player])

  const skipToNext = useCallback(async () => {
    if (!player) return false
    
    try {
      await player.nextTrack()
      return true
    } catch (error) {
      console.error('Skip next error:', error)
      setError('Failed to skip to next track')
      return false
    }
  }, [player])

  const skipToPrevious = useCallback(async () => {
    if (!player) return false
    
    try {
      await player.previousTrack()
      return true
    } catch (error) {
      console.error('Skip previous error:', error)
      setError('Failed to skip to previous track')
      return false
    }
  }, [player])

  const seek = useCallback(async (positionMs) => {
    if (!player) return false
    
    try {
      await player.seek(positionMs)
      return true
    } catch (error) {
      console.error('Seek error:', error)
      setError('Failed to seek')
      return false
    }
  }, [player])

  const setVolume = useCallback(async (volume) => {
    if (!player) return false
    
    try {
      await player.setVolume(volume)
      return true
    } catch (error) {
      console.error('Volume error:', error)
      setError('Failed to set volume')
      return false
    }
  }, [player])

  return {
    player,
    deviceId,
    playerState,
    isReady,
    isActive,
    isPremium,
    error,
    loading,
    initializePlayer,
    play,
    pause,
    skipToNext,
    skipToPrevious,
    seek,
    setVolume,
    clearError: () => setError(null)
  }
}

export default useSpotifyPlayer
