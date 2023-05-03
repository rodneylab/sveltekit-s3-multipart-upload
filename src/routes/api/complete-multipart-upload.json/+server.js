import { authoriseAccount, completeMultipartUpload, getS3Client } from '$lib/utilities/storage';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, setHeaders }) {
	const { key, parts, uploadId } = await request.json();

	try {
		const { s3ApiUrl } = await authoriseAccount();
		if (s3ApiUrl) {
			const client = getS3Client({ s3ApiUrl });
			await completeMultipartUpload({ parts, client, key, uploadId });

			return new Response();
		}

		setHeaders({
			'Content-Type': 'application/json',
		});
		return new Response(JSON.stringify({ message: 'unauthorised' }));
	} catch (error) {
		const message = `Error in route api/complete-multipart-upload.json: ${error}`;
		console.error(message);
		throw new Error(message);
	}
}
