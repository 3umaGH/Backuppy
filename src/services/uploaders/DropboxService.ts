import * as path from 'path'
import * as fs from 'fs'

export class DropboxService {
  private readonly appKey: string
  private readonly appSecret: string

  private access_token: string | null
  private refresh_token: string | null

  constructor(appKey: string, appSecret: string) {
    this.appKey = appKey
    this.appSecret = appSecret

    this.access_token = null
    this.refresh_token = null
  }

  retreiveRefreshToken = (appCode: string) => {
    const appKey = this.appKey
    const appSecret = this.appSecret

    const url = 'https://api.dropbox.com/oauth2/token'
    const body = new URLSearchParams({
      code: appCode,
      grant_type: 'authorization_code',
    })

    const headers = new Headers()
    headers.set('Authorization', 'Basic ' + btoa(appKey + ':' + appSecret))
    headers.set('Content-Type', 'application/x-www-form-urlencoded')

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }

  setTokens = (refresh: string) => {
    this.refresh_token = refresh

    this.refreshAccessToken().then(res => {
      console.log('Retreived new Dropbox access token.')

      this.access_token = res.access_token
      this.startRefreshInterval(res.expires_in)
    })
  }

  startRefreshInterval = (refreshRate: number) => {
    console.log(`Started Dropbox refresh token interval. Refreshing every ${refreshRate} seconds.`)
    setInterval(() => {
      this.refreshAccessToken().then(res => {
        console.log('Retreived new Dropbox access token.')

        this.access_token = res.access_token
      })
    }, (refreshRate - 10) * 1000)
  }

  private refreshAccessToken = async (): Promise<{ access_token: string; expires_in: number }> => {
    if (!this.refresh_token) {
      throw new Error('Refresh token is null')
    }

    const clientId = this.appKey
    const clientSecret = this.appSecret
    const refreshToken = this.refresh_token

    const url = 'https://api.dropbox.com/oauth2/token'

    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret))
    headers.append('Content-Type', 'application/x-www-form-urlencoded')

    const body = new URLSearchParams()
    body.append('grant_type', 'refresh_token')
    body.append('refresh_token', refreshToken)

    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: body,
      redirect: 'follow' as RequestRedirect,
    }

    return await fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        return result
      })
      .catch(error => {
        throw new Error(`Failed to retreive new access token. ${error}`)
      })
  }

  upload = async (file: string) => {
    if (!this.access_token) {
      throw new Error('Access token is null.')
    }

    const data = fs.readFileSync(file)

    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'post',
      body: data,
      headers: {
        Authorization: `Bearer ${this.access_token}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${path.basename(file)}`,
          mode: 'overwrite',
          autorename: true,
        }),
        'Content-Type': 'application/octet-stream',
      },
    })

    if (res.status !== 200) {
      throw new Error(`Failed to upload file to Dropbox. Status: ${res.status}, response: ${await res.text()}`)
    } else {
      return true
    }
  }
}
