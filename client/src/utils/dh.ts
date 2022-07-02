import { useDiffieHellman } from "store/dh.store";
import createECDH from "create-ecdh";

export const CURVE = "secp521r1";

export const createSharedSecret = (otherPublicKey: string): string => {
  const privateKey = useDiffieHellman.getState().privateKey;

  if (!privateKey) {
    throw new Error("No private key");
  }

  const ecdh = createECDH(CURVE);
  ecdh.setPrivateKey(privateKey, "hex");

  const encryptionKey = ecdh.computeSecret(otherPublicKey, "hex", "hex");

  return encryptionKey;
};
