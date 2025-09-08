const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

class SpotifyApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const makeSpotifyRequest = async (endpoint, options = {}, getFreshToken) => {
  let token
  
  try {
    token = await getFreshToken()
  } catch (error) {
    throw new SpotifyApiError('Failed to get Spotify token', 401, 'TOKEN_ERROR')
  }

  const url = `${SPOTIFY_API_BASE}${endpoint}`
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      switch (response.status) {
        case 401:
          throw new SpotifyApiError('Unauthorized - please re-login', 401, 'UNAUTHORIZED')
        case 403:
          if (errorData.error?.reason === 'PREMIUM_REQUIRED') {
            throw new SpotifyApiError('Spotify Premium required for playback', 403, 'PREMIUM_REQUIRED')
          }
          throw new SpotifyApiError('Forbidden - insufficient permissions', 403, 'FORBIDDEN')
        case 429:
          const retryAfter = response.headers.get('Retry-After') || 1
          throw new SpotifyApiError(`Rate limited. Try again in ${retryAfter} seconds`, 429, 'RATE_LIMITED', { retryAfter })
        case 404:
          throw new SpotifyApiError('Resource not found', 404, 'NOT_FOUND')
        default:
          throw new SpotifyApiError(
            errorData.error?.message || `HTTP ${response.status}`,
            response.status,
            'API_ERROR'
          )
      }
    }

    return response.json()
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }
    throw new SpotifyApiError('Network error', 0, 'NETWORK_ERROR')
  }
}

export class SpotifyApi {
  constructor(getFreshToken) {
    this.getFreshToken = getFreshToken
  }

  async getCurrentUser() {
    return makeSpotifyRequest('/me', {}, this.getFreshToken)
  }

  async search(query, type = 'track', limit = 20, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    return makeSpotifyRequest(`/search?${params}`, {}, this.getFreshToken)
  }

  async getUserPlaylists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    return makeSpotifyRequest(`/me/playlists?${params}`, {}, this.getFreshToken)
  }

  async getPlaylist(playlistId) {
    return makeSpotifyRequest(`/playlists/${playlistId}`, {}, this.getFreshToken)
  }

  async getUserSavedTracks(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    return makeSpotifyRequest(`/me/tracks?${params}`, {}, this.getFreshToken)
  }

  async getRecommendations(seedTracks = [], seedArtists = [], seedGenres = [], limit = 20) {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    
    if (seedTracks.length) params.append('seed_tracks', seedTracks.join(','))
    if (seedArtists.length) params.append('seed_artists', seedArtists.join(','))
    if (seedGenres.length) params.append('seed_genres', seedGenres.join(','))
    
    return makeSpotifyRequest(`/recommendations?${params}`, {}, this.getFreshToken)
  }

  async getAvailableDevices() {
    return makeSpotifyRequest('/me/player/devices', {}, this.getFreshToken)
  }

  async getCurrentPlayback() {
    return makeSpotifyRequest('/me/player', {}, this.getFreshToken)
  }

  async transferPlayback(deviceId) {
    return makeSpotifyRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false
      })
    }, this.getFreshToken)
  }

  async play(deviceId, uris = null, contextUri = null) {
    const body = { device_id: deviceId }
    if (uris) body.uris = uris
    if (contextUri) body.context_uri = contextUri

    return makeSpotifyRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(body)
    }, this.getFreshToken)
  }

  async pause() {
    return makeSpotifyRequest('/me/player/pause', {
      method: 'PUT'
    }, this.getFreshToken)
  }

  async skipToNext() {
    return makeSpotifyRequest('/me/player/next', {
      method: 'POST'
    }, this.getFreshToken)
  }

  async skipToPrevious() {
    return makeSpotifyRequest('/me/player/previous', {
      method: 'POST'
    }, this.getFreshToken)
  }
}
