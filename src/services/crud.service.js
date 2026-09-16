export async function listDocuments(Model, filter = {}) {
  return Model.find(filter).sort({
    order: 1,
    createdAt: -1,
  });
}

export async function getDocument(Model, id) {
  return Model.findById(id);
}

export async function createDocument(Model, data) {
  return Model.create(data);
}

export async function updateDocument(Model, id, data) {
  return Model.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function softDeleteDocument(Model, id, extra = {}) {
  return Model.findByIdAndUpdate(
    id,
    {
      deleted: true,
      deletedAt: new Date(),
      ...extra,
    },
    {
      new: true,
      runValidators: true,
    }
  );
}
