export function generateULID() {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const TIME_LEN = 10;
  const RAND_LEN = 16;

  let now = Date.now();

  let timePart = "";
  for (let i = TIME_LEN; i > 0; i--) {
    const mod = now % 32;
    timePart = ENCODING.charAt(mod) + timePart;
    now = Math.floor(now / 32);
  }

  let randomPart = "";
  const randomBytes = new Uint8Array(RAND_LEN);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < RAND_LEN; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < RAND_LEN; i++) {
    const randIdx = randomBytes[i] % 32;
    randomPart += ENCODING.charAt(randIdx);
  }

  return timePart + randomPart;
}

