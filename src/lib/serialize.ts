/**
 * Utility to safely serialize Mongoose lean documents to plain JSON objects.
 * Converts ObjectIds to strings and Date objects to ISO strings.
 */
export function serializeDocument<T>(doc: any): T {
  if (doc === null || doc === undefined) {
    return doc;
  }
  
  // If it's an array, map over it
  if (Array.isArray(doc)) {
    return doc.map(item => serializeDocument(item)) as unknown as T;
  }
  
  // If it's an object, serialize its keys
  if (typeof doc === 'object' && doc.constructor === Object) {
    const serialized: any = {};
    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        const val = doc[key];
        // Convert ObjectId to string
        if (val && typeof val === 'object' && val.constructor && val.constructor.name === 'ObjectId') {
          serialized[key] = val.toString();
        } 
        // Convert Date to ISO string
        else if (val instanceof Date) {
          serialized[key] = val.toISOString();
        } 
        else {
          serialized[key] = serializeDocument(val);
        }
      }
    }
    // Rename _id to id if id doesn't exist
    if (serialized._id && !serialized.id) {
      serialized.id = serialized._id;
    }
    return serialized as T;
  }
  
  // Return primitive values as is
  return doc as T;
}

