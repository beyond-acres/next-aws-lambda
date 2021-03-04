const assert = require("assert")
const fs = require("fs/promises");
const mimetypes = require("mime-types");
const path = require("path");
const util = require("util");

function getMimeType(filePath) {
  return mimetypes.lookup(filePath) || "application/octet-stream"
}

function isBinaryType(mimeType) {
  const mimeCharset = mimetypes.charset(mimeType)
  /* Using https://w3techs.com/technologies/overview/character_encoding/all
   * to be more comprehensive go through those at https://www.iana.org/assignments/character-sets/character-sets.xhtml
   */
  const textualCharSets = [
    "UTF-8",
    "ISO-8859-1",
    "Windows-1251",
    "Windows-1252",
    "Shift_JIS",
    "GB2312",
    "EUC-KR",
    "ISO-8859-2",
    "GBK",
    "Windows-1250",
    "EUC-JP",
    "Big5",
    "ISO-8859-15",
    "Windows-1256",
    "ISO-8859-9",
  ]
  const found = textualCharSets.find(
    (cs) => 0 === cs.localeCompare(mimeCharset, "en", { sensitivity: "base" })
  )
  return found === undefined || found === null
}

async function readFileAsResponse(filePath, context, statusCode = 200) {
  let stream
  try {
    stream = await fs.readFile(filePath)
  } catch (err) {
    if (err.code === "ENOENT") {
      // NOTE: avoid leaking full local path
      const fileName = path.basename(filePath)
      return responseAsError(`File ${fileName} does not exist`, 404)
    }
  }
  let mimeType = getMimeType(filePath)
  return readStreamAsResponse(
    stream,
    context,
    statusCode,
    mimeType
  )
}

function readStreamAsResponse(stream, context, statusCode, mimeType) {
  let body;
  let isBase64Encoded = false;
  if (isBinaryType(mimeType)) {
    isBase64Encoded = true;
    body = Buffer.from(stream).toString("base64");
  } else {
    body = stream.toString("utf8");
  }

  return readStringAsResponse(
    body,
    context,
    statusCode,
    mimeType,
    isBase64Encoded
  );
}

function readStringAsResponse(stringData, context, statusCode, mimeType, isBase64Encoded) {
  assert(mimeType, "expected mimeType to always be provided");

  const response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": mimeType,
    },
    isBase64Encoded,
    body: stringData,
  };
  return response;
}

async function responseAsError(errorText, statusCode) {
  console.warn(errorText)
  return { statusCode }
}

module.exports = readFileAsResponse
