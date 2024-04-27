import {
  ConfigOptions,
  DeliveryType,
  ResourceType,
  UploadApiOptions,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import { Payload } from "payload";
import { SanitizedCollectionConfig } from "payload/types";

import fs from "fs";
import path from "path";
import { CloudinaryPluginRequest } from "../types";

export class CloudinaryService {
  private config?: ConfigOptions;
  private options?: UploadApiOptions;
  private uploadResourceTypeHandler?: Function;
  constructor(
    config?: ConfigOptions,
    options?: UploadApiOptions,
    uploadResourceTypeHandler?: Function
  ) {
    this.config = config;
    this.options = options;
    this.uploadResourceTypeHandler = uploadResourceTypeHandler;
  }
  async upload(
    filename: string,
    buffer: Buffer,
    payload: Payload,
    collectionConfig?: SanitizedCollectionConfig,
    folder?: string,
    addFileNameDate?: boolean
  ): Promise<UploadApiResponse> {
    const _cfg = {
      ...this.config,
      api_key: this.config?.api_key || process.env.CLOUDINARY_API_KEY,
      api_secret: this.config?.api_secret || process.env.CLOUDINARY_API_SECRET,
      cloud_name: this.config?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
    };

    cloudinary.config(_cfg);
    const { staticDir = "__tmp_media__", staticURL = "/media" } =
      collectionConfig?.upload || {};
    const staticPath = path.resolve(payload.config.paths.configDir, staticDir);
    await fs.promises.mkdir(staticPath, { recursive: true });
    
    let newFileName = filename;
    if (addFileNameDate) {
      newFileName = `${new Date().getTime()}_${newFileName}`
    }
    const tmpFileName = path.join(
      staticPath,
      newFileName
    );
    await fs.promises.writeFile(tmpFileName, buffer);
    const _opts = {
      ...this.options,
      // prioritize the folder from the folder field
      folder: folder || this.options?.folder || staticURL,
    };
    let _resourceType = this.options?.resource_type;
    if (!_resourceType) {
      _resourceType = this.uploadResourceTypeHandler
        ? this.uploadResourceTypeHandler(_cfg, _opts, tmpFileName)
        : "auto";
    }
    const uploadPromise = cloudinary.uploader.upload(tmpFileName, {
      ..._opts,
      resource_type: _resourceType
    });
    await fs.promises.rm(tmpFileName);
    return uploadPromise;
  }
  async delete(
    public_id: string,
    options?: {
      resource_type?: ResourceType;
      type?: DeliveryType;
      invalidate?: boolean;
    }
  ): Promise<any> {
    return cloudinary.uploader.destroy(public_id, options);
  }
}
export function mediaManagement(
  config?: ConfigOptions,
  uploadApiOptions?: UploadApiOptions,
  uploadResourceTypeHandler?: Function
) {
  const service = new CloudinaryService(
    config,
    uploadApiOptions,
    uploadResourceTypeHandler
  );
  return (req: CloudinaryPluginRequest, _, next) => {
    req.cloudinaryService = service;
    next();
  };
}
