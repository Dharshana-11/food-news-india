import path from "path";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import ROLES from "../utils/constants/roles.js";
import BusinessAgentRelation from "../models/BusinessAgentRelation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serveDocumentInline = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isAdmin =
      user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

    const isOwner = document.uploadedForUser.toString() === user._id.toString();

    let isAuthorizedAgent = false;

    if (user.role === ROLES.AGENT) {
      const relation = await BusinessAgentRelation.findOne({
        businessOwnerId: document.uploadedForUser,
        agentId: user._id,
        status: "active",
      });

      if (relation && relation.permissions.canUploadDocuments) {
        isAuthorizedAgent = true;
      }
    }

    const isServiceProviderUploader =
      user.role === ROLES.SERVICE_PROVIDER &&
      document.uploadedByUser.toString() === user._id.toString();

    if (
      !isAdmin &&
      !isOwner &&
      !isAuthorizedAgent &&
      !isServiceProviderUploader
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const filePath = path.resolve(__dirname, "..", document.file.filePath);
    return res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: "Error serving file" });
  }
};

export const serveDocumentDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isAdmin =
      user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

    const isOwner = document.uploadedForUser.toString() === user._id.toString();

    // Check if the user is an agent of this business owner
    let isAuthorizedAgent = false;

    if (user.role === ROLES.AGENT) {
      const relation = await BusinessAgentRelation.findOne({
        businessOwnerId: document.uploadedForUser,
        agentId: user._id,
        status: "active",
      });

      if (relation && relation.permissions.canUploadDocuments) {
        isAuthorizedAgent = true;
      }
    }

    const isServiceProviderUploader =
      user.role === ROLES.SERVICE_PROVIDER &&
      document.uploadedByUser.toString() === user._id.toString();

    if (
      !isAdmin &&
      !isOwner &&
      !isAuthorizedAgent &&
      !isServiceProviderUploader
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const filePath = path.resolve(__dirname, "..", document.file.filePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.file.originalName}"`,
    );

    return res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: "Error serving file" });
  }
};
