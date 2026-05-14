const { getStore } = require('@netlify/blobs');

function getPhotosStore() {
  return getStore('astrovault-photos');
}

function thumbUrl(blobKey) {
  return `/.netlify/images?url=/.netlify/blobs/astrovault-photos/${blobKey}&w=400&h=300&fit=cover`;
}

function imageUrl(blobKey) {
  return `/.netlify/blobs/astrovault-photos/${blobKey}`;
}

module.exports = { getPhotosStore, thumbUrl, imageUrl };
