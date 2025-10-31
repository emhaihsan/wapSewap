/**
 * Pinata IPFS Upload Helper
 * Upload images to IPFS via Pinata API
 */

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Upload file to IPFS via Pinata
 * @param file - File to upload
 * @param jwt - Pinata JWT token from env
 * @returns IPFS hash
 */
export async function pinFileToIPFS(file: File, jwt: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload to IPFS");
    }

    const data: PinataUploadResponse = await response.json();
    return data.IpfsHash;
  } catch (error: any) {
    console.error("Pinata upload error:", error);
    throw new Error(error.message || "Failed to upload to IPFS");
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param metadata - NFT metadata object
 * @param jwt - Pinata JWT token
 * @returns IPFS hash
 */
export async function pinJSONToIPFS(metadata: NFTMetadata, jwt: string): Promise<string> {
  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload metadata to IPFS");
    }

    const data: PinataUploadResponse = await response.json();
    return data.IpfsHash;
  } catch (error: any) {
    console.error("Pinata JSON upload error:", error);
    throw new Error(error.message || "Failed to upload metadata to IPFS");
  }
}

/**
 * Validate file for NFT upload
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default 2MB)
 * @returns Error message if invalid, null if valid
 */
export function validateNFTFile(file: File, maxSize: number = 2 * 1024 * 1024): string | null {
  // Check file type
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return "Only PNG and JPEG images are allowed";
  }

  // Check file size
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  return null;
}
