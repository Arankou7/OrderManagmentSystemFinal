import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { categoryApi } from '../../api/categoryApi';

const blankCategory = () => ({
  name: '',
  description: '',
  attributeDefinitions: [{ name: '', inputType: 'TEXT', required: false, allowedValues: '' }],
});

const CategoryManager = ({ categories, onChanged }) => {
  const [form, setForm] = useState(blankCategory);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const setDefinition = (index, field, value) =>
    setForm((current) => ({
      ...current,
      attributeDefinitions: current.attributeDefinitions.map((definition, definitionIndex) =>
        definitionIndex === index ? { ...definition, [field]: value } : definition,
      ),
    }));

  const reset = () => {
    setEditing(null);
    setForm(blankCategory());
  };

  const edit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      attributeDefinitions: category.attributeDefinitions.length
        ? category.attributeDefinitions.map((definition) => ({
            ...definition,
            allowedValues: definition.allowedValues.join(', '),
          }))
        : [{ name: '', inputType: 'TEXT', required: false, allowedValues: '' }],
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const definitions = form.attributeDefinitions
      .filter((definition) => definition.name.trim())
      .map((definition) => ({
        name: definition.name.trim(),
        inputType: definition.inputType,
        required: definition.required,
        allowedValues:
          definition.inputType === 'SELECT'
            ? definition.allowedValues
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
            : [],
      }));
    if (!form.name.trim()) {
      toast.error('A category name is required.');
      return;
    }
    if (
      definitions.some(
        (definition) => definition.inputType === 'SELECT' && definition.allowedValues.length === 0,
      )
    ) {
      toast.error('Select fields need at least one comma-separated option.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        attributeDefinitions: definitions,
      };
      if (editing) await categoryApi.update(editing.id, payload);
      else await categoryApi.create(payload);
      toast.success(editing ? 'Category template updated.' : 'Category template created.');
      reset();
      await onChanged();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.response?.data || 'Category could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (
      !window.confirm(`Delete “${category.name}”? Categories used by products cannot be deleted.`)
    )
      return;
    try {
      await categoryApi.delete(category.id);
      toast.success('Category deleted.');
      if (editing?.id === category.id) reset();
      await onChanged();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.response?.data || 'Category could not be deleted.',
      );
    }
  };

  return (
    <div className="row g-4">
      <div className="col-xl-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between">
              <h2 className="h4">{editing ? 'Edit category' : 'New category'}</h2>
              {editing && (
                <button
                  className="btn btn-sm btn-link"
                  onClick={reset}
                >
                  Cancel
                </button>
              )}
            </div>
            <p className="small text-secondary">
              Define which characteristics a product must provide in this category.
            </p>
            <form onSubmit={submit}>
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
              <label className="form-label mt-3">Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <label className="form-label mb-0">Characteristic template</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      attributeDefinitions: [
                        ...current.attributeDefinitions,
                        { name: '', inputType: 'TEXT', required: false, allowedValues: '' },
                      ],
                    }))
                  }
                >
                  Add field
                </button>
              </div>
              {form.attributeDefinitions.map((definition, index) => (
                <div
                  className="border rounded p-2 mt-2"
                  key={index}
                >
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      placeholder="e.g. RAM"
                      value={definition.name}
                      onChange={(event) => setDefinition(index, 'name', event.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      aria-label="Remove field"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          attributeDefinitions: current.attributeDefinitions.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      ×
                    </button>
                  </div>
                  <div className="row g-2 mt-1">
                    <div className="col-7">
                      <select
                        className="form-select form-select-sm"
                        value={definition.inputType}
                        onChange={(event) => setDefinition(index, 'inputType', event.target.value)}
                      >
                        <option value="TEXT">Text</option>
                        <option value="NUMBER">Number</option>
                        <option value="SELECT">Select list</option>
                      </select>
                    </div>
                    <div className="col-5 form-check d-flex align-items-center">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        checked={definition.required}
                        onChange={(event) => setDefinition(index, 'required', event.target.checked)}
                      />
                      Required
                    </div>
                  </div>
                  {definition.inputType === 'SELECT' && (
                    <input
                      className="form-control form-control-sm mt-2"
                      placeholder="Options, separated by commas"
                      value={definition.allowedValues}
                      onChange={(event) =>
                        setDefinition(index, 'allowedValues', event.target.value)
                      }
                    />
                  )}
                </div>
              ))}
              <button
                className="btn btn-warning w-100 mt-4 fw-bold"
                disabled={saving}
              >
                {saving ? 'Saving…' : editing ? 'Save category' : 'Create category'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-xl-7">
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="p-4 pb-2">
              <h2 className="h4">Category templates</h2>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Characteristics</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="fw-semibold">{category.name}</div>
                        <small className="text-secondary">{category.description}</small>
                      </td>
                      <td>
                        {category.attributeDefinitions.length ? (
                          category.attributeDefinitions.map((definition) => (
                            <span
                              className="badge text-bg-light me-1"
                              key={definition.id || definition.name}
                            >
                              {definition.name}
                              {definition.required ? ' *' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-secondary">No constraints</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => edit(category)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => remove(category)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center p-4 text-secondary"
                      >
                        Create a category template before adding products.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
