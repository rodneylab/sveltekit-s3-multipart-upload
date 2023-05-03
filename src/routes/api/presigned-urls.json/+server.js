import {
	authoriseAccount,
	generatePresignedPartUrls,
	getS3Client,
	initiateMultipartUpload,
	presignedUrls,
} from '$lib/utilities/storage';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, setHeaders }) {
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

						setHeaders({
							'Content-Type': 'application/json',
						});

						return new Response(
							JSON.stringify({
								multipartUploadUrls,
								partCount,
								partSize,
								readSignedUrl,
								writeSignedUrl,
								uploadId,
							}),
						);
					}
				}
			}

			const { readSignedUrl, writeSignedUrl } = await presignedUrls(key);

			setHeaders({
				'Content-Type': 'application/json',
			});

			return new Response(
				JSON.stringify({
					partCount: 1,
					readSignedUrl,
					writeSignedUrl,
				}),
			);
		}
	} catch (error) {
		const message = `Error in route api/presigned-urls.json: ${error}`;
		console.error(message);
		throw new Error(message);
	}
}
