import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PASSWORD_KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await deriveKey(password, salt);

  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const storedKey = Buffer.from(hash, "hex");
  const candidateKey = await deriveKey(password, salt);

  return (
    storedKey.length === candidateKey.length &&
    timingSafeEqual(storedKey, candidateKey)
  );
}

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}
