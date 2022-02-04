import {
  authoriseAccount,
  generatePresignedPartUrls,
  getS3Client,
  initiateMultipartUpload,
  presignedUrls,
} from '$lib/utilities/storage';

export async function post({ request }) {
  const { key, size } = await request.json();

  try {
    const { absoluteMinimumPartSize, recommendedPartSize, s3ApiUrl } = await authoriseAccount();
    if (s3ApiUrl) {
      const client = getS3Client({ s3ApiUrl });
      if (absoluteMinimumPartSize && size > absoluteMinimumPartSize) {
        const uploadId = await initiateMultipartUpload({ client, key });
        if (recommendedPartSize) {
          const partSize =
            size < recommendedPartSize ? absoluteMinimumPartSize : recommendedPartSize;
          const partCount = Math.ceil(size / partSize);
          if (uploadId) {
            const multipartUploadUrls = await generatePresignedPartUrls({
              client,
              key,
              uploadId,
              partCount,
            });

            const { readSignedUrl, writeSignedUrl } = await presignedUrls(key);

            return {
              body: JSON.stringify({
                multipartUploadUrls,
                partCount,
                partSize,
                readSignedUrl,
                writeSignedUrl,
                uploadId,
              }),
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            };
          }
        }
      }

      const { readSignedUrl, writeSignedUrl } = await presignedUrls(key);

      return {
        body: JSON.stringify({ partCount: 1, readSignedUrl, writeSignedUrl }),
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  } catch (error) {
    console.error(`Error in route api/presigned-urls.json: ${error}`);
  }
}
