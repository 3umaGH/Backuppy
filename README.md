# Backuppy

A simple utility service that backs up your MongoDB database collections. Supports multiple databases and custom made uploader services.

## Setup with Dropbox

### Clone the Repository
1. Clone the repository:
   
   ```
   git clone https://github.com/3umaGH/Backuppy.git
   cd backuppy
### Install Dependencies
1. Install the necessary dependencies:
   
   ```npm install```

### Configure the Application
1. Rename and uncomment the config.ts.example file:

   ```mv config.ts.example config.ts```

2. Open config.ts and set the `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` variables with the credentials obtained from the [Dropbox App Console](https://www.dropbox.com/developers/apps?_tk=pilot_lp&_ad=topbar4&_camp=myapps).
3. Replace ### APP KEY ### With your application key credential obtained above and visit
   ```
   https://www.dropbox.com/oauth2/authorize?client_id=### APP KEY ###&response_type=code&token_access_type=offline
5. Copy the Application Code provided.

### Retreive and set the Refresh Token
1. Open `index.ts`, and replace the `dropboxService.setTokens` method with:
   
   ```typescript
    dropboxService.retreiveRefreshToken('### APP CODE ###');
Replace `### APP CODE ###` with the Application Code you received from the Dropbox link above (after authorization).

2. Run the application

   ```
   npm start
3. You will see a console log with the refresh token. Copy this token.
4. Open `config.ts` and set the `DROPBOX_REFRESH_TOKEN` variable to the copied token.
5. Replace the `dropboxService.retreiveRefreshToken` method in `index.ts` with:

   ```typescript
   dropboxService.setTokens(DROPBOX_REFRESH_TOKEN);
### Configure Backup Jobs
1. Open `config.ts` and set your backup jobs array in the following format:
   
    ```typescript
    const backupJobs = [
      {
        uri: '', // Mongo URI
        dbName: '', // Database Name
        collections: [], // Collections to backup
      },
    ];
### Update default config if necessarry
      export const TEMP_PATH = 'C:\\backuppy' - Default temp folder
      export const INTERVAL_HOURS = 6 - Backup interval in hours

### Done!
Your setup is complete. You can now run the application to automatically back up your MongoDB collections.




## Adding Your Own Uploader Services

You can integrate your own custom uploader services with the backup aggregator. To do this, your custom uploader service must implement two methods:

1. **`getName`**: Returns the name of the uploader service.
2. **`upload`**: Handles the upload process. It should take a file path as input and return a promise that resolves to `true` if the upload is successful or throw an error if it fails.

#### Method Definitions

- **`getName: () => string`**  
  This method should return a string representing the name of your uploader service. It helps in identifying which service is being used.

- **`upload: (path: string) => Promise<boolean>`**  
  This method should accept a file path (as a string) and return a promise. The promise should resolve to `true` if the file was successfully uploaded, or throw an error otherwise.

#### Example

Here's an example of how you might define a custom uploader service:

  ```typescript
  class MyUploader {
    // Returns the name of the uploader
    getName(): string {
      return 'MyUploaderService';
    }
  
    // Handles the file upload process
    async upload(path: string): Promise<boolean> {
      try {
        // Implement your upload logic here
        console.log(`Uploading file from path: ${path}`);
        // Simulate successful upload
        return true;
      } catch (error) {
        throw (error)
      }
    }
  }


// Usage example (in index.ts)
const myUploader = new MyUploader();
const backupAggregator = new BackupAggregator(jobs, INTERVAL_HOURS, fileAggregator, [myUploader])

