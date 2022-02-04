import { authoriseAccount, completeMultipartUpload, getS3Client } from '$lib/utilities/storage';

export async function post({ request }) {
  const { key, parts, uploadId } = await request.json();

  try {
    const { s3ApiUrl } = await authoriseAccount();
    if (s3ApiUrl) {
      const client = getS3Client({ s3ApiUrl });
      await completeMultipartUpload({ parts, client, key, uploadId });

      return {
        status: 200,
      };
    }
    return {
      body: JSON.stringify({ message: 'unauthorised' }),
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error(`Error in route api/complete-multipart-upload.json: ${error}`);
  }
}
