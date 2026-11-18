import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

let client: S3Client | null = null;

function readConfig(): R2Config {
  const config = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim() ?? "",
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim() ?? "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim() ?? "",
    bucket: process.env.CLOUDFLARE_R2_BUCKET?.trim() ?? "",
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Cloudflare R2 is not configured (missing: ${missing.join(", ")})`);
  }
  return config;
}

function getClient(config: R2Config) {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

export function isCloudflareR2Configured() {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET,
  );
}

export async function putMediaObject(
  key: string,
  body: Uint8Array,
  contentType: string,
) {
  const config = readConfig();
  await getClient(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: key.startsWith("public/")
        ? "public, max-age=31536000, immutable"
        : "private, no-store",
    }),
  );
}

export async function getMediaObject(key: string) {
  const config = readConfig();
  const result = await getClient(config).send(
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
  );
  if (!result.Body) throw new Error("Cloudflare R2 returned an empty object");
  return {
    bytes: await result.Body.transformToByteArray(),
    contentType: result.ContentType,
  };
}

export async function deleteMediaObject(key: string) {
  const config = readConfig();
  await getClient(config).send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
  );
}
