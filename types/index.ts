export interface ImageType {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  type: 'file' | 'file-version'; // Match ImageKit's possible values
  height: number;
  width: number;
  size: number;
  fileType: string; // ImageKit returns various strings here
  tags?: string[];
  customMetadata?: {
    app?: string;
    [key: string]: any;
  };
  // Include other ImageKit properties
  isPrivateFile?: boolean;
  customCoordinates?: string | null;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
  AITags?: Array<{
    name: string;
    confidence: number;
    source: string;
  }>;
}
// Your other interfaces are fine
export interface AuthParams {
  token: string;
  expire: number;
  signature: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}