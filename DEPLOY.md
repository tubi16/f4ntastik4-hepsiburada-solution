# Deployment Instructions

## Database & Environment Variables
The application requires the following environment variables:
- `EXPO_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API Key.

## Local Docker Build & Run

To build and run the application locally (using Docker):

1.  **Build the Image**:
    You must provide your API key as a build argument.
    ```bash
    docker build --build-arg EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here -t logistics-app .
    ```

2.  **Run the Container**:
    ```bash
    docker run -p 8080:8080 logistics-app
    ```
    Access the app at `http://localhost:8080`.

## Google Cloud Run Deployment

Prerequisites:
- Google Cloud SDK (`gcloud`) installed and authenticated.
- A Google Cloud Project.

1.  **Tag the Image**:
    Replace `PROJECT_ID` with your Google Cloud project ID.
    ```bash
    docker tag logistics-app gcr.io/PROJECT_ID/logistics-app
    ```

2.  **Push the Image**:
    ```bash
    docker push gcr.io/PROJECT_ID/logistics-app
    ```

3.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy logistics-app \
      --image gcr.io/PROJECT_ID/logistics-app \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --port 8080 \\
      --set-env-vars EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key
    ```
    *Note: Since the API key is embedded at build time for the web client, OR replaced at runtime via our entrypoint script, you MUST set `EXPO_PUBLIC_GEMINI_API_KEY` as an environment variable in Cloud Run.*
